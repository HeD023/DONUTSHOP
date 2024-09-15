import { useState, useEffect } from 'react';
import Dough from './Dough.jsx';
import Topping from './Topping.jsx';
import Sprinkles from './Sprinkles.jsx';
import Confirmation from './Confirmation.jsx';

export default function MultiStepForm() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    flavorID: '',
    toppingID: '',
    sprinklesID: '',
    cartID: '',
    productID: 9,
    quantity: 1,
    itemPrice: 0, 
    flavorPrice: 0,
    toppingPrice: 0,
    sprinklesPrice: 0,
  });

  // Fetch หรือกำหนด cartID จาก API ถ้ายังไม่มีค่า
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8082/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            const userID = data.userID;
            fetch('http://localhost:8082/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ UserID: userID }),
            })
              .then(response => response.json())
              .then(data => {
                if (data.status === 'ok') {
                  const cartID = data.CartID;
                  setFormData(prevFormData => ({
                    ...prevFormData,
                    cartID: cartID,
                  }));
                } else {
                  alert('Failed to create or retrieve cart');
                }
              })
              .catch(error => {
                console.error('Error:', error);
              });
          } else {
            alert('Failed to retrieve user data');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, []);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    // Set default productID to 101 if formData.productID is 0 or invalid
    const productID = formData.productID > 0 ? formData.productID : 101;
  
    const orderData = {
      CartID: formData.cartID,
      ProductID: productID,
      Quantity: formData.quantity,
      ItemPrice: formData.flavorPrice + formData.toppingPrice + formData.sprinklesPrice,
      CustomizationIDDough: formData.flavorID,
      CustomizationIDTopping: formData.toppingID,
      CustomizationIDSprinkles: formData.sprinklesID,
    };
  
    console.log("Order Data:", orderData);
  
    fetch('http://localhost:8082/cartitems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          alert('Order submitted successfully!');
        } else {
          alert(`Failed to submit order: ${data.message}`);
        }
      })
      .catch(error => {
        console.error('Error submitting order:', error);
      });
  };
  
  

  return (
    <>
      {step === 1 && <Dough formData={formData} setFormData={setFormData} nextStep={nextStep} />}
      {step === 2 && <Sprinkles formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <Topping formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 4 && <Confirmation formData={formData} prevStep={prevStep} handleSubmit={handleSubmit} />}
    </>
  );
}
