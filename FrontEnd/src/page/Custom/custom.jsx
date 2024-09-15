import MultiStepForm from "./MultiStepForm";
import DonutImage2 from "../../img/pink2.png";
import Nav from "../../Component/Navber";
import { useNavigate } from "react-router-dom";

export default function Custom() {
  const navigate = useNavigate();
  return (
    <>
      <Nav />
      <div className="bg-white flex flex-col min-h-screen">
        <div className="flex flex-row">
          <div className="basis-1/2 relative">
            <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
            <div className="absolute inset-20 mt-14 ml-2 text-5xl text-black luckiest-guy-regular">
              CUSTOM
            </div>
          </div>

          <div className="basis-1/2 relative">
            <img src={DonutImage2} alt="Pink Donut" className="w-full h-full" />
            {/* Buttons Positioned at the Bottom Right Corner */}
            <div className="absolute bottom-4 right-20 flex space-x-4">
              {/* Left Button */}
              <button className=" bg-[#D9D9D9] text-sm text-black  py-2 px-8 rounded-3xl shadow-lg hover:border border-[#000] flex items-center justify-between" 
              onClick={() => navigate("/Manu")}>
                <img
                  src={"/src/img/BT_L.png"}
                  alt="Left Button"
                  className="w-12 h-12 mr-2"
                />
                <div className="text-3xl">DONUT</div>
              </button>
              {/* Right Button */}
              <button className="bg-[#D34C79] text-sm text-white py-2 px-8 rounded-3xl shadow-lg hover:border border-[#000] flex items-center justify-between"
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

        {/* New Flex Container for Image and Form */}
        <div className="flex justify-center items-start mt-14">
          {/* Image on the Left */}
          <div className="flex-none w-1/2 flex justify-center">
            <img
              src="/src/img/custom.png"
              alt="Donut Stack"
              className="w-auto h-[500px] object-contain"
            />
          </div>

          {/* Form on the Right */}
          <div className="flex-none w-1/2 pl-10">
            <MultiStepForm />
          </div>
        </div>
      </div>
    </>
  );
}
