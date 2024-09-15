import PropTypes from 'prop-types';
import { useEffect } from 'react';

export default function Confirmation({ formData, prevStep, handleSubmit }) {
  console.log(formData); // Check if formData is being passed correctly

  const calculateItemPrice = () => {
    return (formData.flavorPrice || 0) + (formData.toppingPrice || 0) + (formData.sprinklesPrice || 0);
  };


  useEffect(() => {
    // Log the calculated item price for debugging
    console.log("Item Price:", calculateItemPrice());
  }, [formData]); // Recalculate only when formData changes

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-3xl text-pink-500 font-bold mb-2">ยืนยันคำสั่งซื้อ</h2>
      <p className="text-sm text-gray-500 mb-6">CHECK YOUR ORDER</p>

      <div className="flex flex-col md:flex-row items-start bg-white w-full p-6 rounded-lg shadow-inner">
        <div className="flex flex-col md:w-1/2">
          <h2 className="text-xl font-bold mb-4">ยืนยันคำสั่งซื้อ</h2>
          <h3 className="mb-2">รสชาติ: {formData.flavorName}</h3>
          <h3 className="mb-2">ท็อปปิ้ง: {formData.toppingName}</h3>
          <h3 className="mb-2">ซอส: {formData.sprinklesName}</h3>
          <h3 className="mt-4 text-lg font-bold">ราคารวม: {calculateItemPrice()} บาท</h3>
        </div>

        <div className="flex justify-center md:w-1/2 mt-4 md:mt-0">
          <img
            src="/src/img/donut0.png"
            alt="Donut Stack"
            className="w-full h-72 object-contain"
          />
        </div>
      </div>

      <div className="flex justify-between w-full mt-6">
        <button
          onClick={prevStep}
          className="px-6 py-3 bg-pink-500 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 focus:outline-none"
        >
          ย้อนกลับ
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-pink-500 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 focus:outline-none"
        >
          ยืนยัน
        </button>
      </div>
    </div>
  );
}

// การตรวจสอบ PropTypes
Confirmation.propTypes = {
  formData: PropTypes.shape({
    flavorName: PropTypes.string.isRequired,
    flavorPrice: PropTypes.number.isRequired,
    toppingName: PropTypes.string.isRequired,
    toppingPrice: PropTypes.number.isRequired,
    sprinklesName: PropTypes.string.isRequired,
    sprinklesPrice: PropTypes.number.isRequired,
    cartID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // เปลี่ยนเป็นรับทั้ง string และ number
  }).isRequired,
  prevStep: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

