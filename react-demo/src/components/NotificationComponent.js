import React, { useEffect } from 'react';

const NotificationComponent = () => {
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8082/ws');

        socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);

            if (notification.type === 'OVER_CONSUMPTION') {
                alert(`Device ${notification.deviceId} exceeded max consumption!`);
            }
        };

        return () => {
            socket.close(); // Cleanup WebSocket on unmount
        };
    }, []);

    return null; // No visual UI for the notification system
};

export default NotificationComponent;
