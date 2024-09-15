var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const secret = 'Fullstack-login';

app.use(cors());
app.use(jsonParser);

const mysql = require('mysql2');
// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'donutshop_db',
});

app.get('/products', jsonParser, function (req, res, next) {
  connection.execute(
    'SELECT `ProductID`, `ProductName`, `Description`, `Price`, `img` FROM `products`',
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err });
        return;
      }
      res.json({ status: 'ok', products: results });
    }
  );
});


app.post('/register', jsonParser, function (req, res, next) {
  bcrypt.hash(req.body.Password, saltRounds, function (err, hash) {
    connection.execute(
      'INSERT INTO member (Email, Password, Username, Address, Phone) VALUES (?, ?, ?, ?, ?)',
      [req.body.Email, hash, req.body.Username, req.body.Address, req.body.Phone],
      function (err, results, fields) {
        if (err) {
          res.json({ status: 'error', message: err });
          return;
        }
        res.json({ status: 'ok' });
      }
    );
  });
});

app.post('/login', jsonParser, function (req, res, next) {
  const email = req.body.Email;
  const password = req.body.Password;

  if (!email || !password) {
    res.json({ status: 'error', message: 'Email or Password is missing' });
    return;
  }

  connection.execute(
    'SELECT * FROM member WHERE Email=?',
    [email],
    function (err, member, fields) {
      if (err) {
        res.json({ status: 'error', message: err });
        return;
      }

      if (member.length == 0) {
        res.json({ status: 'error', message: 'No user found' });
        return;
      }

      bcrypt.compare(password, member[0].Password, function (err, isLogin) {
        if (isLogin) {
          const token = jwt.sign({ Email: member[0].Email }, secret);
          res.json({ status: 'ล็อคอินผ่านแล้วนะ', message: 'Login success', token });
        } else {
          res.json({ status: 'ไม่ผ่านนะสาว', message: 'Login failed' });
        }
      });
    }
  );
});


app.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.json({ status: 'error', message: 'No token provided' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.json({ status: 'error', message: 'Invalid token' });
    }

    connection.execute(
      'SELECT userName, UserID FROM member WHERE Email = ?',
      [decoded.Email],
      (err, results) => {
        if (err) {
          return res.json({ status: 'error', message: err.message });
        }

        if (results.length === 0) {
          return res.json({ status: 'error', message: 'User not found' });
        }

        // ตรวจสอบค่าที่ส่งออกไป
        res.json({ status: 'success', userName: results[0].userName, userID: results[0].UserID });
      }
    );
  });
});



// app.post('/authen', jsonParser, function (req, res, next) {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     var decoded = jwt.verify(token, secret);
//     res.json({ status: 'ok', decoded });
//   } catch (err) {
//     res.json({ status: 'error', message: err.message });
//   }
// });

app.post('/authen', jsonParser, function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.json({ status: 'error', message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.json({ status: 'error', message: 'Token missing' });
    }

    const decoded = jwt.verify(token, secret);
    res.json({ status: 'ok', decoded });
  } catch (err) {
    res.json({ status: 'error', message: err.message });
  }
});



// ตรวจสอบตะกร้าที่มีอยู่ หรือสร้างตะกร้าใหม่
app.post('/cart', jsonParser, function (req, res, next) {
  const userId = req.body.UserID;

  if (userId === undefined) {
    return res.json({ status: 'error', message: 'UserID is required' });
  }

  connection.execute(
    'SELECT CartID FROM cart WHERE UserID = ? AND Status = "active"',
    [userId],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err });
        return;
      }

      if (results.length > 0) {
        res.json({ status: 'ok', CartID: results[0].CartID });
      } else {
        connection.execute(
          'INSERT INTO cart (UserID, Status) VALUES (?, "active")',
          [userId],
          function (err, results, fields) {
            if (err) {
              res.json({ status: 'error', message: err });
              return;
            }
            res.json({ status: 'ok', CartID: results.insertId });
          }
        );
      }
    }
  );
});


// เปลี่ยนสถานะตะกร้าเป็น 'completed'
app.post('/cart/:cartId/complete', jsonParser, function (req, res, next) {
  const cartId = req.params.cartId;

  connection.execute(
    'UPDATE cart SET Status = "completed" WHERE CartID = ?',
    [cartId],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err });
        return;
      }
      res.json({ status: 'ok' });
    }
  );
});


app.post('/confirmPurchase', jsonParser, function (req, res, next) {
  connection.execute(
    'UPDATE cart SET Status = "completed" WHERE CartID = ?',
    [req.body.CartID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err });
        return;
      }
      res.json({ status: 'ok' });
    }
  );
});



// app.post('/cartitems', jsonParser, function (req, res, next) {
//   const cartID = req.body.CartID || null;
//   const productID = req.body.ProductID || null;
//   const quantity = req.body.Quantity || null;
//   const itemPrice = req.body.ItemPrice || null;

//   console.log('CartID:', cartID);
//   console.log('ProductID:', productID);
//   console.log('Quantity:', quantity);
//   console.log('ItemPrice:', itemPrice);
  
//   if (cartID === null || productID === null || quantity === null || itemPrice === null) {
//     return res.json({ status: 'error', message: 'Missing required fields' });
//   }

//   connection.execute(
//     'SELECT COUNT(*) as count FROM products WHERE ProductID = ?',
//     [productID],
//     function (err, results, fields) {
//       if (err) {
//         res.json({ status: 'error', message: err });
//         return;
//       }
//       if (results[0].count === 0) {
//         return res.json({ status: 'error', message: 'ProductID does not exist' });
//       }

//       connection.execute(
//         'INSERT INTO cartitems (CartID, ProductID, Quantity, ItemPrice) VALUES (?, ?, ?, ?)',
//         [cartID, productID, quantity, itemPrice],
//         function (err, results, fields) {
//           if (err) {
//             console.log('Insert Error:', err);
//             res.json({ status: 'error', message: err });
//             return;
//           }
//           res.json({ status: 'ok' });
//         }
//       );
//     }
//   );
// });

app.post('/cartitems', jsonParser, function (req, res, next) {
  const cartID = req.body.CartID || null;
  const productID = req.body.ProductID || 0;
  const quantity = req.body.Quantity || 1;
  const itemPrice = req.body.ItemPrice || 0;
  const CustomizationIDDough = req.body.CustomizationIDDough || null;
  const CustomizationIDTopping = req.body.CustomizationIDTopping || null;
  const CustomizationIDSprinkles = req.body.CustomizationIDSprinkles || null;

  if (!cartID || !productID || !quantity || !itemPrice) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  connection.execute(
    'INSERT INTO cartitems (CartID, ProductID, Quantity, CustomizationIDDough, CustomizationIDTopping, CustomizationIDSprinkles, ItemPrice) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [cartID, productID, quantity, CustomizationIDDough, CustomizationIDTopping, CustomizationIDSprinkles, itemPrice],
    function (err, results, fields) {
      if (err) {
        console.error('Insert Error:', err);
        return res.status(500).json({ status: 'error', message: 'Database insert error', error: err });
      }
      res.json({ status: 'ok' });
    }
  );
});





// สร้าง API สำหรับดึงข้อมูลจากตาราง customdonuts
app.get('/customdonuts', jsonParser, function (req, res, next) {
  connection.execute(
    'SELECT * FROM customdonuts',
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err });
        return;
      }
      res.json({ status: 'ok', products: results });
    }
  );
});

// เพิ่ม API สำหรับดึงข้อมูลการสั่งซื้อของผู้ใช้
app.get('/user/:userId/orders', jsonParser, function (req, res, next) {
  const userId = req.params.userId;

  connection.execute(
    'SELECT ci.*, p.ProductName FROM cartitems ci JOIN products p ON ci.ProductID = p.ProductID WHERE ci.CartID IN (SELECT CartID FROM cart WHERE UserID = ? AND Status = "completed")',
    [userId],
    function (err, results, fields) {
      if (err) {
        return res.json({ status: 'error', message: err.message });
      }
      res.json({ status: 'ok', orders: results });
    }
  );
});

app.get('/cartitems', (req, res) => {
  const cartID = req.query.CartID;

  if (!cartID) {
    return res.json({ status: 'error', message: 'CartID is required' });
  }

  // ดึงข้อมูลรายการสินค้าและรายละเอียดสินค้า
  connection.execute(
    `SELECT ci.*, p.ProductName, p.Description, p.Price, p.img
     FROM cartitems ci
     JOIN products p ON ci.ProductID = p.ProductID
     WHERE ci.CartID = ?`,
    [cartID],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.json({ status: 'error', message: 'Database error' });
      }

      if (results.length === 0) {
        return res.json({ status: 'error', message: 'No items found for the given CartID' });
      }

      res.json({ status: 'success', data: results });
    }
  );
});

app.delete('/cartitems/:id', async (req, res) => {
  const { id } = req.params; // Ensure `id` is defined here

  try {
    const result = await new Promise((resolve, reject) => {
      connection.query('DELETE FROM cartitems WHERE CartItemID = ?', [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting item with ID ${id}:`, error); // Ensure `id` is available here
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/cartitems/:CartItemID', async (req, res) => {
  const cartItemID = req.params.CartItemID;
  console.log(`Deleting item with ID: ${cartItemID}`);
  try {
    const result = await deleteCartItemByID(cartItemID);
    if (result) {
      res.status(200).json({ status: 'success', message: 'Item deleted' });
    } else {
      console.log('Item not found');
      res.status(404).json({ status: 'error', message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});


app.post('/orders2', async (req, res) => {
  try {
    const { UserID, TotalAmount, CartID } = req.body;

    if (!UserID || !TotalAmount || !CartID) {
      return res.status(400).json({ status: 'error', message: 'Invalid order data' });
    }

    // Use connection.execute to create the order
    const [result] = await connection.promise().execute(
      'INSERT INTO orders (UserID, OrderDate, TotalAmount, CartID) VALUES (?, NOW(), ?, ?)',
      [UserID, TotalAmount, CartID]
    );

    const OrderID = result.insertId;

    res.json({ status: 'ok', OrderID });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create order' });
  }
});

app.post('/orderitems', async (req, res) => {
  try {
    const orderItems = req.body;

    // Check if orderItems is valid
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid order items' });
    }

    // Insert each order item
    for (const item of orderItems) {
      const {
        OrderID,
        ProductID,
        Quantity,
        CustomizationIDDough = null, // Default to null if not provided
        CustomizationIDTopping = null, // Default to null if not provided
        CustomizationIDSprinkles = null, // Default to null if not provided
        ItemPrice
      } = item;

      // Check if required fields are present
      if (!OrderID || !ProductID || !Quantity || !ItemPrice) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
      }

      await connection.promise().execute(
        'INSERT INTO orderitems (OrderID, ProductID, Quantity, CustomizationIDDough, CustomizationIDTopping, CustomizationIDSprinkles, ItemPrice) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [OrderID, ProductID, Quantity, CustomizationIDDough || null, CustomizationIDTopping || null, CustomizationIDSprinkles || null, ItemPrice]
      );
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error creating order items:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create order items' });
  }
});


app.get('/orders2', async (req, res) => {
  try {
    const { UserID } = req.query;

    if (!UserID) {
      return res.status(400).json({ status: 'error', message: 'UserID is required' });
    }

    // Fetch the latest orders for the user
    const [orders] = await connection.promise().query(
      'SELECT * FROM orders WHERE UserID = ? ORDER BY OrderID DESC',
      [UserID]
    );

    res.json({ status: 'success', orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch orders' });
  }
});

// Backend: Express.js
app.get('/orderitems', async (req, res) => {
  try {
    const { OrderID } = req.query;

    if (!OrderID) {
      return res.status(400).json({ status: 'error', message: 'OrderID is required' });
    }

    // Fetch order items for the given OrderID
    const [orderItems] = await connection.promise().query(
      'SELECT * FROM orderitems WHERE OrderID = ?',
      [OrderID]
    );

    res.json({ status: 'success', orderItems });
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch order items' });
  }
});

// In your backend file (e.g., server.js or app.js)
app.get('/top-products', async (req, res) => {
  try {
    const [rows] = await connection.promise().query(`
      SELECT ProductID, SUM(Quantity) as TotalQuantity
      FROM orderitems
      GROUP BY ProductID
      ORDER BY TotalQuantity DESC
      LIMIT 3
    `);

    res.json({ status: 'success', products: rows });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch top products' });
  }
});







const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
