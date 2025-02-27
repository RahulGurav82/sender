import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, MapPin, XCircle, Navigation, Shield, Truck } from 'lucide-react';

const Dashboard = () => {
    const [status, setStatus] = useState('OFF'); // Track the status (ON/OFF)
    const [location, setLocation] = useState(null); // Track the user's location

    // Function to get the user's current location
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    console.log('Location fetched:', latitude, longitude);
                },
                (error) => {
                    console.error('Error fetching location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    // Function to fetch the latest status from the server
    const fetchStatus = async () => {
        try {
            const response = await axios.get('https://esp-server-c5yc.onrender.com/fetch');
            const { status: serverStatus } = response.data;
            setStatus(serverStatus); // Update the status in the state
            console.log('Status fetched:', serverStatus);
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    // Auto-refresh the status every 1 second
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchStatus(); // Fetch the latest status
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    // Function to send location and status to the server
    const sendLocation = async () => {
        // Fetch the location first
        getLocation();

        if (!location) {
            alert('Please allow location access and try again.');
            return;
        }

        try {
            const response = await axios.post('https://esp-server-c5yc.onrender.com/UpdateStatus', {
                status: 'ON',
                latitude: location.latitude,
                longitude: location.longitude,
            });
            console.log('Server response:', response.data);
            setStatus('ON');

            // Send location continuously every 1 second
            const intervalId = setInterval(async () => {
                if (status === 'ON') {
                    getLocation(); // Fetch the latest location
                    await axios.post('https://esp-server-c5yc.onrender.com/UpdateStatus', {
                        status: 'ON',
                        latitude: location.latitude,
                        longitude: location.longitude,
                    });
                    console.log('Location sent:', location);
                } else {
                    clearInterval(intervalId); // Stop sending location
                }
            }, 1000);
        } catch (error) {
            console.error('Error sending location:', error);
        }
    };

    // Function to stop sending location
    const stopLocation = async () => {
        try {
            const response = await axios.post('https://esp-server-c5yc.onrender.com/UpdateStatus', {
                status: 'OFF',
                latitude: null,
                longitude: null,
            });
            console.log('Server response:', response.data);
            setStatus('OFF');
        } catch (error) {
            console.error('Error stopping location:', error);
        }
    };

    // Function to send emergency alert (placeholder function)
    const sendEmergencyAlert = () => {
        alert("Emergency alert feature will be implemented in the next version");
        // Here you would add the actual implementation to send an emergency alert
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-50 to-green-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                    <Truck className="text-green-600 mr-2" size={32} />
                    <h2 className="text-3xl font-bold text-green-900">Ambulance Dashboard</h2>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                    <div className="flex items-center justify-center">
                        <Shield className="text-green-700 mr-2" size={24} />
                        <p className="text-xl text-center text-gray-700">
                            Status: <span className={`font-semibold ${status === 'ON' ? 'text-green-700' : 'text-red-600'}`}>{status}</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={sendLocation}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                    >
                        <Navigation className="mr-2" size={20} />
                        <span className="font-medium">Send Location</span>
                    </button>
                    
                    <button
                        onClick={stopLocation}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center"
                    >
                        <XCircle className="mr-2" size={20} />
                        <span className="font-medium">Stop Location</span>
                    </button>
                    
                    <button
                        onClick={sendEmergencyAlert}
                        className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg hover:bg-amber-600 transition duration-300 flex items-center justify-center"
                    >
                        <Bell className="mr-2" size={20} />
                        <span className="font-medium">Emergency Alert</span>
                    </button>
                </div>
                
                <div className="mt-6 text-center text-gray-500 text-sm">
                    <p>Location updates help other emergency vehicles track your position</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;