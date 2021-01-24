import socketIOClient from "socket.io-client";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import Home from "./Home";
import ChatRoom from "./ChatRoom";

const App = ({}) => {
	return (
		<Router>
			<Switch>
				<Route exact path="/" component={Home} />
				<Route exact path="/:username" component={ChatRoom} />
			</Switch>
		</Router>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
