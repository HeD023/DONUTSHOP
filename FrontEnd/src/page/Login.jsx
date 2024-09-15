import DonutImage2 from "../img/pink2.png";
import { Link } from "react-router-dom";

export default function Login() {

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);

        const formData = {
            Email: data.get('email'), // Change 'email' to 'Email'
            Password: data.get('password'), // Change 'password' to 'Password'
        };

        console.log(formData);

        fetch('http://localhost:8082/login', { // Replace with your actual endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json()) // Corrected the typo here
        .then(data => {
            if (data.status === 'ล็อคอินผ่านแล้วนะ'){
                // alert('login sucess')
                localStorage.setItem('token', data.token)
                 window.location = '/Home'
                // window.location = '/Manu'
            } else {
                alert('login failed')
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    return (
        <>
        <div className="relative h-screen flex items-center justify-center">
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 bg-[#D34C79]"></div>
                <div className="flex-1 bg-white">
                    <div className="flex flex-row w-full h-full">
                        <div className="basis-1/2 ">
                            <img src={DonutImage2} alt="Pink Donut" className="w-full " />
                        </div>
                        <div className="basis-1/2 ">
                            <img src={DonutImage2} alt="Pink Donut" className="w-full h-auto" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute z-10 flex items-center justify-center w-full max-w-md bg-white p-8 rounded-3xl shadow-md">
                <div>
                    <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" // Added name attribute
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D34C79]"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" // Added name attribute
                                placeholder="Enter your password"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D34C79]"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button 
                                type="submit" 
                                className="w-full bg-[#D34C79] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-gray-600 text-sm mt-4">
                        Do not have an account?
                        <Link to="/Signin" className="text-[#D34C79] font-bold">Sign up</Link> 
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
