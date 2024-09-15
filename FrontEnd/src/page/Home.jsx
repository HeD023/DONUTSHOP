import Nav from "../Component/Navber";
import Donutfooters from "../Component/footer";
import DonutImage from "../img/Donut.png";
import DonutImage2 from "../img/pink2.png";
import DonutImage3 from "../img/donut0.png";
import { useEffect,useState } from "react";


function Home() {

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location = '/login'
    } 
    const [products, setProducts] = useState([]);
  const [topProductIDs, setTopProductIDs] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Fetch top products to get their IDs
    fetch('http://localhost:8082/top-products')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const ids = data.products.map(product => product.ProductID);
          setTopProductIDs(ids);

          // Fetch all products
          return fetch('http://localhost:8082/products');
        } else {
          alert('Unable to fetch top products');
          throw new Error('Top products fetch failed');
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          setProducts(data.products);

          // Filter products to include only those in the topProductIDs
          const filtered = data.products.filter(product =>
            topProductIDs.includes(product.ProductID)
          );
          setFilteredProducts(filtered);
        } else {
          alert('Unable to fetch products');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  return (
    <div className="bg-[#D34C79]">
      <Nav />

      <button onClick={handleLogout}>ออกจากระบบ</button>
      <div className="flex flex-col items-center justify-center ">
        {/* ส่วนที่1 */}
        <div className="flex flex-col items-center justify-center bg-[#D34C79] luckiest-guy-regular my-24">
          <div>
            <a className="text-[12vw] leading-none text-slate-50">
              Donut Donut
            </a>
          </div>
          <div className="relative">
            <a className="text-[12vw] leading-none text-slate-50">
              By Mushroom
            </a>
            <img
              src={DonutImage}
              alt="Donut"
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full h-auto"
            />
          </div>
        </div>

        {/* ส่วนที่2 */}
        <div className="bg-white flex flex-col">
          <div>
            <div className="flex flex-row ">
              <div className="basis-1/2">
                <img
                  src={DonutImage2}
                  alt="Pink Donut"
                  className="w-full h-full"
                />
              </div>
              <div className="basis-1/2">
                <img
                  src={DonutImage2}
                  alt="Pink Donut"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-row ">
              <div className="basis-1/2 flex justify-center items-center">
                <img
                  src={DonutImage3}
                  alt="Pink Donut"
                  className="w-[620px] "
                />
              </div>
              <div className="basis-1/2 flex flex-col justify-center text-black">
                <h1 className="text-6xl mb-4 luckiest-guy-regular  ">
                  Donut Donut By Mushroom
                </h1>
                <h1 className="text-3xl mb-4 mt-10">
                  สร้างสรรค์โดนัทในแบบของคุณ
                </h1>
                <h1 className="text-3xl mb-4">ด้วยวัตถุดิบคุณภาพสูง</h1>
                <h1 className="text-3xl mb-4"> เลือกท็อปปิ้งที่คุณชื่นชอบ</h1>
                <h1 className="text-3xl mb-4">
                  เพื่อความอร่อยที่พิเศษและไม่เหมือนใคร
                </h1>
                <button className="bg-[#D34C79] text-xl text-white py-4 w-52 rounded-full shadow-lg luxurious-script-regular hover:border border-[#000] mt-10">
                  Buy Now!!
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนที่3 */}
      <div className="bg-white p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Top 3 Products with Highest Quantity</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 ">
        {filteredProducts.map((product) => (
          <div
            key={product.ProductID}
            className="card bg-white shadow-xl flex flex-col items-center "
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
      </div>

      <Donutfooters />
    </div>
  );
}

export default Home;
