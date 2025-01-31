import React, { Component } from 'react';
import UserService from "./services/UserService";
import { withRouter } from "react-router-dom";

class LoginComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
    }

    handleLogin = async (e) => {
        e.preventDefault();

        try {
            const { email, password } = this.state;
            const loginRequest = { email, password };
            console.log("Email:", email);
            console.log("Password:", password);

            const response = await UserService.login(loginRequest);

            if (response.data) {
                console.log("Successful");
                const { role, id } = response.data;

                localStorage.setItem('userRole', role);

                if (role === 'admin') {
                    this.props.history.push("/user");
                } else {
                    this.props.history.push(`/view-user/${id}`);
                }
            }
        } catch (error) {
            console.error("Login failed", error);
            alert("Invalid email or password");
        }
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    render() {
        const { email, password } = this.state;

        return (
            <div className="container mt-4" style={{ maxWidth: "400px"}}>
                <h2>Login</h2>
                <form onSubmit={this.handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="text"
                            className="form-control"
                            name="email"
                            value={email}
                            onChange={this.handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={password}
                            onChange={this.handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-danger mt-3">Login</button>
                </form>
            </div>
        );
    }
}

export default withRouter(LoginComponent);
