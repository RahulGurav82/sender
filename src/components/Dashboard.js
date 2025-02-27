import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-50 to-green-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-green-900 mb-6">Ambulance Driver Dashboard</h2>
                <p className="text-center text-gray-700 mb-6">Status: <span className="font-semibold">{status}</span></p>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={sendLocation}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Send Location
                    </button>
                    <button
                        onClick={stopLocation}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
                    >
                        Stop Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;