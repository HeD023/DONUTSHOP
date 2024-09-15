import DonutImage2 from "../img/pink2.png";
import { Link } from "react-router-dom";

export default function Signin() {

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget; // Reference to the form element
        const data = new FormData(form);
    
        const formData = {
            Email: data.get('email'), 
            Password: data.get('password'), 
            Username: data.get('username'), 
            Address: data.get('address'), 
            Phone: data.get('phone'), 
        };
    
        console.log(formData);
    
        fetch('http://localhost:8082/register', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'okดี'){
                alert('register success');
                form.reset(); // Clear the form fields
            } else {
                alert('register success');
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
                    <h2 className="text-2xl font-semibold text-center mb-6">Sign in</h2>
                    <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                              Username
                            </label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                placeholder="Enter your username"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D34C79]"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Phone
                            </label>
                            <input 
                                type="text" 
                                id="phone" 
                                name="phone" 
                                placeholder="Enter your phone"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D34C79]"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Address
                            </label>
                            <input 
                                type="text" 
                                id="address" 
                                name="address" 
                                placeholder="Enter your Address"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D34C79]"
                            />
                        </div>

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
                                Sign up
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-gray-600 text-sm mt-4">
                        Do not have an account?
                        <Link to="/" className="text-[#D34C79] font-bold">Login</Link> 
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
