import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navber.css';

export default function Nav() {
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate(); // ใช้สำหรับการนำทาง
  const location = useLocation(); // ใช้เพื่อตรวจสอบเส้นทางปัจจุบัน

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8082/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setUserName(data.userName);
        } else {
          setUserName(null);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setUserName(null);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // ลบ token ออกจาก localStorage
    setUserName(null); // รีเซ็ต userName
    navigate('/'); // นำทางไปที่หน้า login
  };

  const getLinkClass = (path) => {
    return location.pathname === path ? 'bg-[#D34C79] text-white' : 'text-[#D34C79]';
  };

  return (
    <div>
      <div className="navbar bg-slate-50 luxurious-script-regular">
        <div className="flex-1">
          <a className="btn btn-ghost text-4xl luxurious-script-regular text-[#D34C79]">Donut By Mushroom</a>
        </div>
        <div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 luckiest-guy-regular text-2xl">
              <li><Link to="/Home" className={getLinkClass('/Home')}>HOME</Link></li>
              <li><Link to="/Manu" className={getLinkClass('/Manu')}>MANU</Link></li>
              <li><Link to="/Cart" className={getLinkClass('/Cart')}>CART</Link></li>
              <li><Link to="/Order" className={getLinkClass('/Order')}>ORDER</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex-none">
          {userName ? (
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 luckiest-guy-regular text-2xl">
                <li><h1 className="text-[#D34C79]"> | {userName}</h1></li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-500 text-xl text-white py-2 px-6 rounded-full shadow-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 luckiest-guy-regular text-2xl">
                <li>
                  <Link to="/">
                    <button className="bg-[#D34C79] text-xl text-white py-2 px-6 rounded-full shadow-lg hover:border border-[#000]">
                      log in
                    </button>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
