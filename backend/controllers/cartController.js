// backend/controllers/cartController.js
import db from '../config/db.js';

/**
 * GET /api/cart/:userId
 * Returns all items in a user's cart with joined listing + book + seller info.
 */
export async function getCart(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const query = `
      SELECT
        c.CartID        AS cart_id,
        c.UserID        AS user_id,
        c.ListingID     AS listing_id,
        c.Quantity      AS quantity,
        l.Price         AS price,
        l.Condition     AS item_condition,
        l.Quantity      AS available_quantity,
        b.Title         AS title,
        b.Author        AS author,
        u.Name          AS seller_name
      FROM cart c
      JOIN listings l ON c.ListingID = l.ListingID   -- FIXED
      JOIN books    b ON l.BookID = b.BookID         -- FIXED
      JOIN users    u ON l.SellerID = u.UserID       -- FIXED
      WHERE c.UserID = ?
    `;

    const [rows] = await db.query(query, [userId]);
    return res.json(rows);

  } catch (error) {
    console.error('Get cart error:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch cart', message: error.message });
  }
}

/**
 * POST /api/cart/add
 * Body: { userID, listingID, quantity }
 */
export async function addToCart(req, res) {
  try {
    const userId = req.body.userID || req.body.UserID;
    const listingId = req.body.listingID || req.body.ListingID;
    const quantity = Number(req.body.quantity) || 1;

    if (!userId || !listingId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check listing availability
    const [listings] = await db.query(
      'SELECT Quantity FROM listings WHERE ListingID = ? AND Status = "Available"',
      [listingId]
    );

    if (listings.length === 0) {
      return res.status(404).json({ error: 'Listing not available' });
    }

    if (listings[0].Quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    // Check if already in cart
    const [existing] = await db.query(
      'SELECT CartID, Quantity FROM cart WHERE UserID = ? AND ListingID = ?',
      [userId, listingId]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET Quantity = Quantity + ? WHERE UserID = ? AND ListingID = ?',
        [quantity, userId, listingId]
      );
    } else {
      await db.query(
        'INSERT INTO cart (UserID, ListingID, Quantity) VALUES (?, ?, ?)',
        [userId, listingId, quantity]
      );
    }

    // Updated cart
    const [cartItems] = await db.query(
      `
      SELECT
        c.CartID      AS cart_id,
        c.ListingID   AS listing_id,
        c.Quantity    AS quantity,
        l.Price       AS price,
        b.Title       AS title,
        u.Name        AS seller_name
      FROM cart c
      JOIN listings l ON c.ListingID = l.ListingID
      JOIN books    b ON l.BookID = b.BookID
      JOIN users    u ON l.SellerID = u.UserID
      WHERE c.UserID = ?
      `,
      [userId]
    );

    return res.json({
      ok: true,
      message: 'Added to cart',
      cart: cartItems,
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return res
      .status(500)
      .json({ error: 'Failed to add to cart', message: error.message });
  }
}

/**
 * POST /api/cart/remove
 * Body: { userID, listingID }
 */
export async function removeFromCart(req, res) {
  try {
    const userId = req.body.userID || req.body.UserID;
    const listingId = req.body.listingID || req.body.ListingID;

    if (!userId || !listingId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.query(
      'DELETE FROM cart WHERE UserID = ? AND ListingID = ?',
      [userId, listingId]
    );

    const [cartItems] = await db.query(
      `
      SELECT
        c.CartID      AS cart_id,
        c.ListingID   AS listing_id,
        c.Quantity    AS quantity,
        l.Price       AS price,
        b.Title       AS title
      FROM cart c
      JOIN listings l ON c.ListingID = l.ListingID
      JOIN books    b ON l.BookID = b.BookID
      WHERE c.UserID = ?
      `,
      [userId]
    );

    return res.json({
      ok: true,
      message: 'Removed from cart',
      cart: cartItems,
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    return res
      .status(500)
      .json({ error: 'Failed to remove from cart', message: error.message });
  }
}
