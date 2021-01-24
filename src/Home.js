import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

const Home = (props) => {
	const [username, setUsername] = React.useState("");

	const handleUsernameChange = (event) => {
		setUsername(event.target.value);
	};

	return (
		<div className="home-container">
			<div className="header-chat">Join Chat</div>

			<label>Please enter your username</label>
			<input
				type="text"
				placeholder=""
				value={username}
				onChange={handleUsernameChange}
				className="username-input-field"
			/>
			<button id="next">
				<Link to={`/${username}`} className="enter-room-button">
					Next
				</Link>
			</button>
		</div>
	);
};

export default Home;
