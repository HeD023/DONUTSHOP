import { useState, useEffect } from "react";
import Nav from "../Component/Navber";
import DonutImage2 from "../img/pink2.png";
import { useNavigate } from "react-router-dom";

function Manu() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [currentCartID, setCurrentCartID] = useState(null);
  const [userID, setUserID] = useState(null); // เพิ่ม state สำหรับ UserID

  useEffect(() => {
    // ดึงข้อมูลผลิตภัณฑ์
    fetch('http://localhost:8082/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.text().then(text => {
          console.error('Server Error:', text);
          throw new Error('Failed to load products');
        });
      }
    })
    .then(data => {
      if (data.status === 'ok') {
        setProducts(data.products);
        const initialQuantities = {};
        data.products.forEach(product => {
          initialQuantities[product.ProductID] = 1;
        });
        setQuantities(initialQuantities);
      } else {
        alert('Failed to load products');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    // ดึงข้อมูลผู้ใช้และตะกร้าเมื่อ component ถูกเรนเดอร์
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8082/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.text().then(text => {
            console.error('Server Error:', text);
            throw new Error('Failed to retrieve user data');
          });
        }
      })
      .then(data => {
        if (data.status === 'success') {
          const userID = data.userID;
          setUserID(userID); // เก็บ UserID ใน state
          console.log("UserID:", userID); // แสดง UserID ในคอนโซล
  
          fetch(`http://localhost:8082/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ UserID: userID })
          })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              return response.text().then(text => {
                console.error('Server Error:', text);
                throw new Error('Failed to create or retrieve cart');
              });
            }
          })
          .then(data => {
            if (data.status === 'ok') {
              const cartID = data.CartID;
              setCurrentCartID(cartID);
              console.log("CartID:", cartID); // แสดง CartID ในคอนโซล
            } else {
              alert('Failed to create or retrieve cart');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
        } else {
          alert('Failed to retrieve user data');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }, []);

  const handleQuantityChange = (productId, change) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: Math.max(0, (prevQuantities[productId] || 0) + change)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.ProductID];
    const token = localStorage.getItem('token');
    if (quantity > 0) {
      console.log('Adding to cart:', {
        CartID: currentCartID,  // ตรวจสอบว่ามี currentCartID หรือไม่
        ProductID: product.ProductID,
        Quantity: quantity,
        Price: product.Price
      });
  
      // เพิ่มสินค้าเข้าไปในตะกร้า พร้อมกับ quantity
      setCartItems(prevItems => [
        ...prevItems,
        { ...product, quantity }
      ]);
  
      // ส่งข้อมูลไป backend หรือทำการบันทึกใน frontend ตามที่ต้องการ
      fetch('http://localhost:8082/cartitems', {
        
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          CartID: currentCartID,  // ใช้ currentCartID ที่ได้จาก backend
          ProductID: product.ProductID,
          Quantity: quantity,
          ItemPrice: product.Price
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          alert('Added to cart successfully');
        } else {
          alert('Failed to add to cart');
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart');
      });
    } else {
      alert('Please select at least one item');
    }
  };
  

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (token && cartItems.length > 0) {
      fetch('http://localhost:8082/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const userID = data.userID;
  
          // ดึง CartID ของผู้ใช้ที่ล็อกอิน
          fetch(`http://localhost:8082/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ UserID: userID })
          })
          .then(response => response.json())
          .then(data => {
            if (data.status === 'ok') {
              const cartID = data.CartID;
              setCurrentCartID(cartID); // บันทึก CartID ปัจจุบัน
              console.log("CartID (Checkout):", cartID); // แสดง CartID ในคอนโซล
  
              // เพิ่มสินค้าในตะกร้าใหม่
              cartItems.forEach(item => {
                fetch('http://localhost:8082/cartitems', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    CartID: cartID,
                    ProductID: item.ProductID,
                    Quantity: item.quantity,
                    ItemPrice: item.Price
                  })
                });
              });
              alert('Checkout successful!');
              setCartItems([]); // ล้างตะกร้าชั่วคราว
            } else {
              alert('Failed to create or retrieve cart');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
          });
        } else {
          alert('Failed to retrieve user data');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An unexpected error occurred');
      });
    } else {
      alert('Please add items to the cart');
    }
  };

  const handlePlaceOrder = () => {
    const token = localStorage.getItem('token');
    console.log('currentCartID:', currentCartID);

    if (token && currentCartID && cartItems.length > 0) {
      cartItems.forEach(item => {
        console.log('Sending:', {
          CartID: currentCartID,
          ProductID: item.ProductID,
          Quantity: item.quantity,
          ItemPrice: item.Price
        });
  
        fetch('http://localhost:8082/cartitems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            CartID: currentCartID,
            ProductID: item.ProductID,
            Quantity: item.quantity,
            ItemPrice: item.Price
          })
        })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              console.error('Server Error:', text);
              throw new Error('Failed to add item to cart');
            });
          }
          return response.json();
        })
        .then(data => {
          if (data.status !== 'ok') {
            alert('Failed to add item to cart');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('An error occurred while adding item to cart');
        });
      });
  
      // เปลี่ยนสถานะตะกร้าเป็น 'completed' หลังจากสั่งซื้อเสร็จ
      fetch(`http://localhost:8082/cart/${currentCartID}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          alert('Order placed successfully!');
          setCartItems([]);
          setCurrentCartID(null);
        } else {
          alert('Failed to complete the order');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred');
      });
    } else {
      alert('Please add items to the cart and checkout first');
    }
  };
  
  
  return (
    <>
      <Nav />
      <div className="bg-white flex flex-col">
      <div className="flex flex-row">
          <div className="basis-1/2 relative">
            <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
            <div className="absolute inset-20 mt-14 ml-2 text-5xl text-black luckiest-guy-regular">
              MANU
            </div>
          </div>

          <div className="basis-1/2 relative">
            <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
            {/* Buttons Positioned at the Bottom Right Corner */}
            <div className="absolute bottom-4 right-20 flex space-x-4">
              {/* Left Button */}
              <button className="bg-[#D34C79] text-sm text-white py-2 px-8 rounded-3xl shadow-lg hover:border border-[#000] flex items-center justify-between" 
               onClick={() => navigate("/Manu")}>
                <img
                  src={"/src/img/BT_L.png"}
                  alt="Left Button"
                  className="w-12 h-12 mr-2"
                />
                <div className="text-3xl">DONUT</div>
              </button>
              {/* Right Button */}
              <button className="bg-[#D9D9D9] text-sm text-black py-2 px-8 rounded-3xl shadow-lg hover:border border-[#000] flex items-center justify-between"
              onClick={() => navigate("/Custom")}>
                <img
                  src={"/src/img/BT_R.png"}
                  alt="Right Button"
                  className="w-12 h-12 mr-2"
                />
                <div className="text-3xl">CUSTOM</div>
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.ProductID}
                className="card bg-white shadow-xl flex flex-col items-center"
              >
                <figure className="px-10 pt-10">
                  <img
                    src={`/src/img/${product.img}`}
                    alt={product.ProductName}
                    className="rounded-xl w-[273px] h-[257px]"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h2 className="card-title">{product.ProductName}</h2>
                  <h1>${product.Price}</h1>
                  <div className="flex w-full text-sm text-gray-600 items-center">
                    <button
                      onClick={() => handleQuantityChange(product.ProductID, -1)}
                      className="text-lg font-bold px-3"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center">
                      {quantities[product.ProductID]} piece
                      {quantities[product.ProductID] > 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.ProductID, 1)}
                      className="text-lg font-bold px-3"
                    >
                      +
                    </button>
                    <span className="flex-1 text-right">bath</span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-[#D34C79] text-xl text-white py-2 px-6 rounded-full shadow-lg hover:border border-[#000] mt-6"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCheckout}
              className="bg-[#D34C79] text-xl text-white py-2 px-6 rounded-full shadow-lg hover:border border-[#000]"
            >
              Checkout
            </button>
            <button
              onClick={handlePlaceOrder}
              className="bg-[#D34C79] text-xl text-white py-2 px-6 rounded-full shadow-lg hover:border border-[#000] ml-4"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Manu;
