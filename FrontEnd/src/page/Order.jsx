import { useEffect, useState } from "react";
import Nav from "../Component/Navber";
import DonutImage2 from "../img/pink2.png";
import { useNavigate } from "react-router-dom";

export default function Order() {
  const navigate = useNavigate();
  const [userID, setUserID] = useState(null);
  const [latestOrderID, setLatestOrderID] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect to login if no token
      return;
    }
  
    // Fetch user data and latest order as before...
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
  
        // Fetch latest order as before...
        fetch(`http://localhost:8082/orders2?UserID=${userID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            const latestOrder = data.orders.reduce((latest, order) => 
              order.OrderID > latest.OrderID ? order : latest
            );
            const latestOrderID = latestOrder.OrderID;
            const totalAmount = latestOrder.TotalAmount;
            setLatestOrderID(latestOrderID);
            setTotalAmount(totalAmount);
  
            // Fetch order items
            fetch(`http://localhost:8082/orderitems?OrderID=${latestOrderID}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            })
            .then(response => response.json())
            .then(data => {
              if (data.status === 'success') {
                setOrderItems(data.orderItems);
  
                // Extract ProductIDs from orderItems and fetch product details
                const productIDs = data.orderItems.map(item => item.ProductID).join(',');
  
                fetch(`http://localhost:8082/products?ProductIDs=${productIDs}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                })
                .then(response => response.json())
                .then(productData => {
                  if (productData.status === 'ok') {
                    // Map product details to order items
                    const productsMap = productData.products.reduce((map, product) => {
                      map[product.ProductID] = product;
                      return map;
                    }, {});
  
                    // Merge product details into order items
                    const enrichedOrderItems = data.orderItems.map(item => ({
                      ...item,
                      ProductName: productsMap[item.ProductID]?.ProductName,
                      img: productsMap[item.ProductID]?.img,
                      Price: productsMap[item.ProductID]?.Price
                    }));
  
                    setOrderItems(enrichedOrderItems);
                  } else {
                    alert('Failed to fetch product details');
                  }
                })
                .catch(error => {
                  console.error('Error fetching products:', error);
                });
              } else {
                alert('Unable to fetch order items');
              }
            })
            .catch((error) => {
              console.error('Error fetching order items:', error);
            });
          } else {
            alert('Unable to fetch orders');
          }
        })
        .catch((error) => {
          console.error('Error fetching orders:', error);
        });
      } else {
        alert('Failed to retrieve user data');
      }
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
    });
  }, [navigate]);
  
  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <div className="flex flex-row bg-white">
        <div className="basis-1/2 relative">
          <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
          <div className="absolute inset-20 mt-14 ml-3 text-5xl text-black luckiest-guy-regular">
            ORDER
          </div>
        </div>
        <div className="basis-1/2 relative">
          <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
        </div>
      </div>

      <div className="p-10">
        {/* Display latest OrderID */}
        <div className=" font-bold text-xl mb-5 text-black">
          OrderID: {latestOrderID}
        </div>
        
        <table className="table">
          <thead>
            <tr  className="text-lg text-black bg-[#d34c79]">
              <th>ลำดับ</th>
              <th></th>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th>ราคาต่อชิ้น</th>
              <th>ราคา</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={item.OrderItemID} className="text-black text-lg">
                <td>{index + 1}</td>
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
                <td>{item.Quantity * item.ItemPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold text-xl mt-5 text-black">
          Total Amount: {totalAmount}
        </div>
      </div>
    </div>
  );
}
