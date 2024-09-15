import { useEffect, useState } from "react";
import Nav from "../Component/Navber";
import DonutImage2 from "../img/pink2.png";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [userID, setUserID] = useState(null);
  const [currentCartID, setCurrentCartID] = useState(null);
  const [cartItems, setCartItems] = useState([]); // State for storing cart items
  const [totalPrice, setTotalPrice] = useState(0); // State for total price

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data and cart ID on component mount
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
          setUserID(userID);

          // Fetch cart ID
          fetch('http://localhost:8082/cart', {
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
              setCurrentCartID(cartID);

              // Fetch cart items with CartID
              fetch(`http://localhost:8082/cartitems?CartID=${cartID}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              })
              .then(response => response.json())
              .then(data => {
                if (data.status === 'success') {
                  setCartItems(data.data);
                  calculateTotalPrice(data.data); // Calculate total price
                } else {
                  alert('Failed to retrieve cart items');
                }
              })
              .catch((error) => {
                console.error('Error fetching cart items:', error);
              });
            } else {
              alert('Failed to create or retrieve cart');
            }
          })
          .catch((error) => {
            console.error('Error fetching cart ID:', error);
          });
        } else {
          alert('Failed to retrieve user data');
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
    }
  }, []);

  // Function to remove item from cart
  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User not authenticated');
        return;
      }
  
      const response = await fetch(`http://localhost:8082/cartitems/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Item deleted:', data);
      setCartItems(prevItems => prevItems.filter(item => item.CartItemID !== itemId)); // Update state after deletion
  
      // Recalculate total price after deletion
      calculateTotalPrice(cartItems.filter(item => item.CartItemID !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert(`Failed to remove item: ${error.message}`);
    }
  };
  
  // Function to calculate total price
  const calculateTotalPrice = (items) => {
    const total = items.reduce((sum, item) => sum + (item.Quantity * item.ItemPrice), 0);
    setTotalPrice(total);
  };

  // Function to handle order confirmation
  const handleConfirmOrder = async () => {
    const confirm = window.confirm('Are you sure you want to place the order?');
    
    if (!confirm) {
      return; // Exit if the user does not confirm
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User not authenticated');
        return;
      }
  
      // Prepare order data
      const orderData = {
        UserID: userID,
        TotalAmount: totalPrice,
        CartID: currentCartID
      };
  
      const orderResponse = await fetch('http://localhost:8082/orders2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });
  
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(`HTTP error! status: ${orderResponse.status}, details: ${errorText}`);
      }
  
      const orderResult = await orderResponse.json();
      if (orderResult.status !== 'ok') {
        throw new Error('Failed to create order');
      }
  
      const orderID = orderResult.OrderID;
  
      const orderItemsData = cartItems.map(item => ({
        OrderID: orderID,
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        CustomizationDough: item.CustomizationDough || null,
        CustomizationTopping: item.CustomizationTopping || null,
        CustomizationSprinkles: item.CustomizationSprinkles || null,
        ItemPrice: item.ItemPrice,
      }));
  
      const orderItemsResponse = await fetch('http://localhost:8082/orderitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderItemsData),
      });
  
      if (!orderItemsResponse.ok) {
        const errorText = await orderItemsResponse.text();
        throw new Error(`HTTP error! status: ${orderItemsResponse.status}, details: ${errorText}`);
      }
  
      const orderItemsResult = await orderItemsResponse.json();
      if (orderItemsResult.status !== 'ok') {
        throw new Error('Failed to create order items');
      }
  
      // Clear all cart items from server
      const cartItemsDeleteResponse = await fetch(`http://localhost:8082/cartitems/${currentCartID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!cartItemsDeleteResponse.ok) {
        const errorText = await cartItemsDeleteResponse.text();
        throw new Error(`HTTP error! status: ${cartItemsDeleteResponse.status}, details: ${errorText}`);
      }
  
      // Clear the cart itself from server
      const cartClearResponse = await fetch(`http://localhost:8082/cart/${currentCartID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!cartClearResponse.ok) {
        const errorText = await cartClearResponse.text();
        throw new Error(`HTTP error! status: ${cartClearResponse.status}, details: ${errorText}`);
      }
  
      // Clear cart items from state
      setCartItems([]);
      setTotalPrice(0);
      localStorage.removeItem('cartItems'); // Ensure cart data is removed from local storage if you use it
  
      alert('Order placed successfully');
      navigate('/Order'); // Navigate to the Order page or another page as needed
    
    } catch (error) {
      console.error('Error confirming order:', error);
     
      navigate('/Order');
       alert(`Failed to place order`);
      // alert(`Failed to place order: ${error.message}`);
    }
  };
  
  
  
  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <div className="flex flex-row bg-white">
        <div className="basis-1/2 relative">
          <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
          <div className="absolute inset-20 mt-14 ml-3 text-5xl text-black luckiest-guy-regular">
            CART
          </div>
        </div>
        <div className="basis-1/2 relative">
          <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
        </div>
      </div>

      <div className="p-10 bg-white">
        <table className="table">
          <thead>
            <tr className="text-lg text-black bg-[#d5537e]">
              <th>#</th>
              <th>Image</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Item Price</th>
              <th>Total Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={item.CartItemID} className="text-black text-lg">
                <td>{index + 1}</td> {/* Sequential numbering */}
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src={`/src/img/${item.img}`}
                          alt={item.ProductName}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td>{item.ProductName}</td>
                <td>{item.Quantity}</td>
                <td>{item.ItemPrice}</td>
                <td>{item.Quantity * item.ItemPrice}</td> {/* Total price */}
                <td>
                  <button 
                    className="btn btn-error btn-xs"
                    onClick={() => removeItem(item.CartItemID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold text-xl mt-5 text-black ">
          Total Price: {totalPrice}
        </div>
        <button 
          className="btn btn-primary mt-5"
          onClick={handleConfirmOrder}
        >
          Confirm Order
        </button>
        <button 
          className="btn btn-error mt-5 ml-5"
          onClick={handleConfirmOrder}
        >
          ลบทั้งหมด
        </button>
      </div>
    </div>
  );
}
