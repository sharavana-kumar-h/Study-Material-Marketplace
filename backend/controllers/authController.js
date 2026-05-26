import db from '../config/db.js';
import bcrypt from 'bcrypt';

export async function register(req, res) {
  try {
    const { name, email, password, DepartmentID } = req.body;

    // Validation
    if (!name || !email || !password || !DepartmentID) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists (DB column is `Email`)
    const [existingUser] = await db.query('SELECT UserID FROM users WHERE Email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user using DB column names
    const [result] = await db.query(
      'INSERT INTO users (Name, Email, PasswordHash, DepartmentID) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, DepartmentID]
    );

    const user = {
      userID: result.insertId,
      name,
      email,
      departmentID: DepartmentID,
    };

    res.json({
      ok: true,
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user (DB column is `Email` and other columns are PascalCase)
    const [users] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare passwords (DB column is `PasswordHash`)
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const response = {
      ok: true,
      message: 'Login successful',
      user: {
        userID: user.UserID,
        name: user.Name ,
        email: user.Email ,
        departmentID: user.DepartmentID ,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
}
