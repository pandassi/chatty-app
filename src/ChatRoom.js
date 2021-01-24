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

const ChatRoom = (props) => {
	let timeout;
	const [users, setUsers] = useState([]);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
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

	const { username } = useParams();

	const socket = useMemo(
		() =>
			socketIOClient(
				encodeURI(`https://pager-hiring.herokuapp.com/?username=${username}`)
			),
		[]
	);

	useEffect(() => {
		socket.on("connect", () => {
			socket.emit("username", username);
			setUsers((users) => [...users, { name: username, id: 1, text: message }]);
		});
		socket.on("user-connected", (user) => {
			setUsers((users) => [...users, user]);
		});
		socket.on("message", (message) => {
			setMessages((messages) => [...messages, message]);
		});

		socket.on("user-disconnected", (id) => {
			setUsers((users) => {
				return users.filter((user) => user.id !== id);
			});
		});

		socket.on("is-typing", (typers) => {
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
		clearTimeout(timeout);
	}

	function handleKeyDown(event) {
		if (48 <= event.keyCode <= 57 || 65 <= event.keycode <= 90) {
			socket.emit("typing", { status: true });
			timeout = setTimeout(timeoutFunction, 3000);
		}
	}

	const submit = (event) => {
		event.preventDefault();
		if (selectedImage) {
			socket.emit("image-message", { url: selectedImage, alt: "" });
			setImages([]);
			setSelectedImage(null);
		}
		if (message) {
			socket.emit("text-message", message);
			setMessage("");
		}
	};

	return (
		<>
			<div className="messages-container">
				<div className="wrapper">
					<div className="container">
						<div className="col-12">
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
							}}
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
			</div>
		</>
	);
};

export default ChatRoom;
