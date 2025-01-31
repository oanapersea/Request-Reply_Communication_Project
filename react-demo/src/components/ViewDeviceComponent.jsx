import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import DeviceService from "../services/DeviceService";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; // For v6+ of @stomp/stompjs

class ViewDeviceComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.match.params.id,
            device: {},
            notifications: {} // Track notifications by device ID
        };


        this.stompClient = null; // WebSocket client
    }

    componentDidMount() {
        // Fetch device details
        DeviceService.getDeviceById(this.state.id).then(res => {
            this.setState({ device: res.data });
        });

        // Initialize WebSocket connection
        this.initializeWebSocketConnection();
    }

    componentWillUnmount() {
        // Disconnect the WebSocket client on component unmount
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }

    initializeWebSocketConnection = () => {
        if (this.stompClient) {
            console.log('WebSocket client already initialized');
            return;
        }

        console.log('Initializing WebSocket connection');
        const socket = new SockJS('http://localhost:8082/ws');
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = () => {
            console.log('Connected to WebSocket');
            this.stompClient.subscribe(`/topic/notifications/${this.state.id}`, (message) => {
                console.log("Received notification: ", message.body); // Debugging
                if (message.body) {
                    const notification = JSON.parse(message.body);
                    this.addNotification(notification); // Add or update notification
                }
            });
        };

        this.stompClient.onStompError = (frame) => {
            console.error('STOMP error', frame.headers['message'], frame.body);
        };

        this.stompClient.activate();
    };


    addNotification = (notification) => {
        // Create a new object to avoid mutating the state directly
        this.setState((prevState) => {
            const updatedNotifications = { ...prevState.notifications };

            // Check if the notification for the device already exists
            if (updatedNotifications[notification.deviceId]) {
                // Update the existing notification for this device
                updatedNotifications[notification.deviceId] = notification;
            } else {
                // If no existing notification, add it to the list
                updatedNotifications[notification.deviceId] = notification;
            }

            return { notifications: updatedNotifications };
        });
    };


    render() {
        const { device, notifications } = this.state;

        // Get the current notification for this device
        const notification = notifications[device.id];

        return (
            <div className="container mt-4">
                <div className="card col-md-6 offset-md-3"></div>
                <h3 className="text-center"> View Device Details</h3>
                <div className="card-body">
                    <div className="row">
                        <label> Description: </label>
                        <div> {device.description} </div>
                    </div>
                    <div className="row">
                        <label> Address: </label>
                        <div> {device.address} </div>
                    </div>
                    <div className="row">
                        <label> MaxConsumption: </label>
                        <div> {device.maxConsumption} </div>
                    </div>
                    <div className="row">
                        <label> User ID: </label>
                        <div> {device.userId} </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h4>Notifications</h4>
                    <ul className="list-group">
                        {notification ? (
                            <li className="list-group-item">
                                {notification.message} (Time: {new Date(notification.timestamp).toLocaleString()})
                            </li>
                        ) : (
                            <li className="list-group-item">No notifications yet</li>
                        )}
                    </ul>
                </div>
            </div>
        );
    }
}

    export default withRouter(ViewDeviceComponent);
