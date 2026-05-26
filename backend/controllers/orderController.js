import db from "../config/db.js";

/* ---------------------------------------------
   GET ORDERS FOR A SPECIFIC BUYER
   /api/orders/:userId
---------------------------------------------- */
export async function getOrders(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ error: "User ID required" });

    const query = `
      SELECT
        o.OrderID AS order_id,
        o.BuyerID AS buyer_id,
        o.ListingID AS listing_id,
        o.Status AS status,
        o.OrderDate AS order_date,

        l.Price AS price,
        l.Quantity AS listing_quantity,

        b.Title AS title,
        b.Author AS author,

        u.Name AS seller_name
      FROM orders o
      JOIN listings l ON o.ListingID = l.ListingID
      JOIN books b ON l.BookID = b.BookID
      JOIN users u ON l.SellerID = u.UserID
      WHERE o.BuyerID = ?
      ORDER BY o.OrderDate DESC
    `;

    const [rows] = await db.query(query, [userId]);
    res.json(rows);

  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders", message: error.message });
  }
}



/* ---------------------------------------------
   GET ORDERS WHERE USER IS THE SELLER
   /api/orders/selling/:userId
---------------------------------------------- */
export async function getSellingOrders(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ error: "User ID required" });

    const query = `
      SELECT
        o.OrderID AS order_id,
        o.Status AS status,
        o.OrderDate AS order_date,
        o.ListingID AS listing_id,

        b.Title AS title,
        b.Author AS author,
        l.Price AS price,

        buyer.Name AS buyer_name,
        buyer.Email AS buyer_email

      FROM orders o
      JOIN listings l ON o.ListingID = l.ListingID
      JOIN books b ON l.BookID = b.BookID
      JOIN users buyer ON o.BuyerID = buyer.UserID
      WHERE l.SellerID = ?
      ORDER BY o.OrderDate DESC
    `;

    const [rows] = await db.query(query, [userId]);
    res.json(rows);

  } catch (error) {
    console.error("Get Selling Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch selling orders", message: error.message });
  }
}



/* ---------------------------------------------
   CHECKOUT — CREATES ORDER FOR EACH CART ITEM
   /api/orders/checkout
---------------------------------------------- */
export async function checkout(req, res) {
  const connection = await db.getConnection();

  try {
    const { UserID } = req.body;

    if (!UserID) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Get cart
    const [cart] = await connection.query(
      `SELECT c.ListingID, c.Quantity, l.Price, l.SellerID, b.Title
       FROM cart c
       JOIN listings l ON c.ListingID = l.ListingID
       JOIN books b ON l.BookID = b.BookID
       WHERE c.UserID = ?`,
      [UserID]
    );

    if (cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    await connection.beginTransaction();

    let orders = [];
    let totalAmount = 0;

    for (const item of cart) {
      // Validate stock
      const [[listing]] = await connection.query(
        "SELECT Quantity FROM listings WHERE ListingID = ?",
        [item.ListingID]
      );

      if (!listing || listing.Quantity < item.Quantity) {
        throw new Error(`Insufficient quantity for ${item.Title}`);
      }

      // Create order
      const [result] = await connection.query(
        `INSERT INTO orders (BuyerID, ListingID, Status, OrderDate)
         VALUES (?, ?, 'Completed', NOW())`,
        [UserID, item.ListingID]
      );

      // Update stock
      await connection.query(
        `UPDATE listings SET Quantity = Quantity - ? WHERE ListingID = ?`,
        [item.Quantity, item.ListingID]
      );

      // Mark sold if 0 left
      await connection.query(
        `UPDATE listings SET Status = 'Sold' WHERE ListingID = ? AND Quantity = 0`,
        [item.ListingID]
      );

      totalAmount += item.Price * item.Quantity;

      orders.push({
        order_id: result.insertId,
        listing_id: item.ListingID,
        title: item.Title,
        quantity: item.Quantity,
        price: item.Price,
        subtotal: item.Price * item.Quantity,
      });
    }

    // Clear cart
    await connection.query("DELETE FROM cart WHERE UserID = ?", [UserID]);

    await connection.commit();
    connection.release();

    res.json({
      ok: true,
      message: "Checkout successful",
      totalAmount,
      orders,
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Checkout Error:", error);
    res.status(500).json({ error: "Checkout failed", message: error.message });
  }
}
