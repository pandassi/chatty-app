import socketIOClient from "socket.io-client";
import React, { useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import Home from "./Home";
import GifSearch from "./GifSearch";
import UIAvatar from "react-ui-avatars";

//const username = prompt("Enter your username");

const ChatRoom = (props) => {
	let timeout;
	//list of users and messages
	const [users, setUsers] = useState([]);
	const [message, setMessage] = useState(""); //stores what I have in input, generate new state for var
	const [messages, setMessages] = useState([]); //1st state of messages would be an empty array
	// const [image, setImage] = useState("");
	const [images, setImages] = useState([]);
	const [userTyping, setUserTyping] = useState({});
	const [selectedImage, setSelectedImage] = useState(null);
	const [sentImages, setSentImages] = useState([]);

	const sentItems = [...messages, ...sentImages];
	const sortedSentItems = sentItems.sort((a, b) =>
		a.time.localeCompare(b.time)
	);

	const typing = false;

	const getTypers = (typers) => {
		//console.log("all the typers", JSON.stringify(typers));
		if (typers[username]) {
			delete typers[username];
		}

		if (!Object.keys(typers).length) {
			return null;
		}
		return Object.keys(typers).length > 1
			? "People are typing"
			: `${Object.keys(typers)[0]} is typing`;
	};

	// console.log("users that are typing", userTyping);

	const { username } = useParams(); //retourne les params de la route

	//provide the url for user connection
	const socket = useMemo(
		() =>
			socketIOClient(
				encodeURI(`https://pager-hiring.herokuapp.com/?username=${username}`)
			),
		[]
	);
	//useMemo = appellé juste 1x connection serveur 1x

	useEffect(() => {
		socket.on("connect", () => {
			socket.emit("username", username);
			//Adds given username to the list on top
			setUsers((users) => [...users, { name: username, id: 1, text: message }]);
		});

		//debugger;
		//socket has different events that can emitted, handlers so specific events
		//ce que je reçois
		//console.log("user-connected");
		socket.on("user-connected", (user) => {
			//debugger;
			//calling function: new value or user or call back, return new function of user, returning new array with all users (...), merging all previous users + appending new user in that new array
			setUsers((users) => [...users, user]);
		});
		//getting all messages that happening in message event
		socket.on("message", (message) => {
			// console.log("message", message);
			//debugger;
			//console.log("message", message);
			setMessages((messages) => [...messages, message]); //merge object inside array
			//console.log("only messages", messages);
		});

		socket.on("user-disconnected", (id) => {
			//debugger;
			setUsers((users) => {
				return users.filter((user) => user.id !== id);
			});
		});

		socket.on("is-typing", (typers) => {
			// console.log("userTyping", userTyping, "current user", user);
			//console.log("typers", JSON.stringify(typers));
			for (let typer in typers) {
				if (typers[typer].status === false) {
					delete typers[typer];
				}
			}
			setUserTyping(typers);
		});

		socket.on("user-stopped-typing-server", (user) => {
			const updatedUsers = userTyping.filter(
				(currentUser) => currentUser !== user.username
			);
			setUserTyping(updatedUsers);
		});
	}, []);

	function timeoutFunction() {
		socket.emit("typing", { status: false });
		//console.log("type");
		clearTimeout(timeout);
	}

	function handleKeyDown(event) {
		if (48 <= event.keyCode <= 57 || 65 <= event.keycode <= 90) {
			socket.emit("typing", { status: true });
			//console.log("hey");
			timeout = setTimeout(timeoutFunction, 3000);
		}
	}

	const submit = (event) => {
		//prevent the page from reloading
		event.preventDefault();
		//ce que j'envoie
		if (selectedImage) {
			//console.log("about to emit");
			socket.emit("image-message", { url: selectedImage, alt: "" });
			setImages([]);
			setSelectedImage(null);
		}
		if (message) {
			socket.emit("text-message", message);
			setMessage("");
		}
	};

	// const handleKeyDown = event => {
	//   if (48 <= event.keyCode <= 57 || 65 <= event.keycode <= 90) {
	//     // console.log("keystroke", event.keyCode);
	//     socket.emit("user-typing-frontend");
	//   }
	//   // 48 - 57 NUMBERS
	//   // 65 - 90 lowercase alphabets
	// };

	// const handleKeyUp = event => {
	//   if (48 <= event.keyCode <= 57 || 65 <= event.keycode <= 90) {
	//     socket.emit("user-stopped-typing-frontend");
	//   }
	// };

	return (
		<>
			<div className="messages-container">
				{/* <div className="row">
                <div className="col-md-12 mt-4 mb-4">
                    <div>Hello {username}</div>
                </div>
            </div> */}
				<div className="wrapper">
					<div className="container">
						<div className="col-12">
							{/* map that info, list of messages list of var */}
							{/* {console.log("only messages", sortedSentItems)} */}
							{sortedSentItems.map(
								({ type, username, text, time, url, alt }, index) => {
									if (type === "text") {
										return (
											<div className="row" id="messages">
												<div className="col-2">
													<UIAvatar className="avatar" name={username} />
												</div>
												<div className="col-10">
													<div key={index}>
														<div className="row">
															<div className="username">
																{username}
																<span className="date">
																	{moment(time).format("h:mm a")}
																</span>
															</div>
														</div>
														<div className="row">
															<div className="message">{text}</div>
														</div>
													</div>
												</div>
											</div>
										);
									} else if (type === "image") {
										return (
											<div className="row" id="messages">
												<div className="col-2">
													<UIAvatar className="avatar" name={username} />
												</div>
												<div key={index}>
													<div className="row">
														<div className="username">
															{username}
															<span className="date">
																{moment(time).format("h:mm a")}
															</span>
														</div>
													</div>
													<div className="row">
														<div className="message">
															<img src={url} alt={alt} />
														</div>
													</div>
												</div>
											</div>
										);
									}
								}
							)}
						</div>
					</div>
				</div>
				<form onSubmit={submit} id="form">
					<div className="input-group">
						<input
							name="message"
							maxLength="60"
							type="text"
							placeholder="Message"
							className="form-control"
							onChange={(e) => {
								setMessage(e.currentTarget.value);
							}} //acces current target property and show value
							value={message}
							id="text"
							onKeyDown={handleKeyDown}
						/>
						<button id="send" type="submit" className="btn btn-primary">
							Send
						</button>
					</div>

					{Object.keys(userTyping).length ? (
						<div className="typing">{getTypers(userTyping)}</div>
					) : null}
					<GifSearch
						selectedImage={selectedImage}
						setSelectedImage={setSelectedImage}
						images={images}
						setImages={setImages}
					/>
				</form>
				{/* <div>Connected Users:</div>
                    <div id="users">
                        {users.map(({ name, id }) => (
                            <div key={id}>{username}</div>
                        ))}
                    </div> */}
			</div>
		</>
	);
};

export default ChatRoom;
