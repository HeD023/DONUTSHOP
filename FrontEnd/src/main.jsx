import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
// import App from './App.jsx'
import Login from './page/login.jsx'
import Home from './page/Home.jsx'
import Signin from './page/Signin.jsx'
import Manu from './page/Manu.jsx'
import Dough from './page/Custom/Dough.jsx'
import Cart from './page/Cart.jsx'
import Custom from './page/Custom/Custom.jsx'
import Order from './page/Order.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/* <Route path='/' element={<App />} /> */}
      <Route path='/' element={<Login />} />
      <Route path='/Home' element={<Home />} />
      <Route path='/Signin' element={<Signin />} />
      <Route path='/Manu' element={<Manu />} />
      <Route path='/Cart' element={<Cart />} />
      <Route path='/Dough' element={<Dough />} />
      <Route path='/Custom' element={<Custom />} />
      <Route path='/Order' element={<Order />} />
      

    </Routes>
  </BrowserRouter>
)
