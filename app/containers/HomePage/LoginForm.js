import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://localhost:4000';

function LoginForm({ Login, error }) {
  const [details, setDetails] = useState({ name: '', email: '', password: '' });

  const submitHandler = e => {
    e.preventDefault();

    Login(details);
  };
  useEffect(() => {
    console.log('loginForm loaded');
    //The socket is a module that exports the actual socket.io socket
    const socket = socketIOClient(ENDPOINT);
    // const socket = socketIOClient("ws://localhost:4000");

    socket.on('connect', () => {
      // either with send()
      socket.send('Hello!');
      console.log('socket connected ', socket.id);
      socket.on('disconnect', () => {
        console.log('Socket Disconnected');
        // onDisconnect();
      });
    });

    // fetchQR();
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchQR = async () => {
    // const data = await fetch('https://fakestoreapi.com/products/1')
    const data = await fetch('http://localhost:4000/verify-qrcode')
      .then(res => res.json())
      .then(json => console.log(json));

      // console.log(data);
  };

  return (
    <button id="LoginButton">Login</button>
    // <form onSubmit={submitHandler}>
    //   <div className="form-inner">
    //     <h2>Login</h2>
    //     {error != "" ? <div className="error">{error}</div> : ""}
    //     <div className="form-group">
    //       <label htmlForm="name">Name:</label>
    //       <input
    //         type="text"
    //         name="name"
    //         id="name"
    //         onChange={(e) => setDetails({ ...details, name: e.target.value })}
    //         value={details.name}
    //       />
    //     </div>
    //     <div className="form-group">
    //       <label htmlForm="email">Email:</label>
    //       <input
    //         type="email"
    //         name="email"
    //         id="email"
    //         onChange={(e) => setDetails({ ...details, email: e.target.value })}
    //         value={details.email}
    //       />
    //     </div>
    //     <div className="form-group">
    //       <label htmlForm="name">Password:</label>
    //       <input
    //         type="password"
    //         name="password"
    //         id="password"
    //         onChange={(e) =>
    //           setDetails({ ...details, password: e.target.value })
    //         }
    //         value={details.password}
    //       />
    //     </div>
    //     <input type="submit" value="LOGIN" />
    //   </div>
    // </form>
  );
}

export default LoginForm;
