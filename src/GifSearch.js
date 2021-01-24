import React from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";

const GifSearch = (props) => {
	const [search, setSearch] = useState("");
	const { selectedImage, setSelectedImage, images, setImages } = props;

	const GiphyAPI_Key = "IhCgclim0UMP856DyhpXoCczEiQOKGZw";
	const searchGif = () => {
		if (search.length > 0) {
			fetch(
				"https://api.giphy.com/v1/gifs/search?api_key=" +
					GiphyAPI_Key +
					"&q=" +
					search
			)
				.then((res) => {
					return res.json();
				})
				.then((result) => {
					setImages(
						result.data.map((image) => {
							return image.images.fixed_height.url;
						})
					);
				})
				.catch((err) => {
					console.log("Something went wrong", err);
				});
		}
	};

	return (
		<>
			<div className="gif-header">
				<input
					type="text"
					placeholder="Search & Select your GIF"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="form-control"
					id="image"
				/>
				<button
					id="search"
					onClick={() => {
						setSelectedImage(null);
						setSearch("");
						searchGif();
					}}
				>
					Search
				</button>
			</div>
			<div className="gifResult">
				{selectedImage ? (
					<>
						<div className="selected-image-container">
							<img id="selected-image" src={selectedImage} />
						</div>
						<button id="send" type="submit" className="btn btn-primary">
							Send GIF
						</button>
					</>
				) : (
					<div className="list">
						{images.map((image, index) => (
							<div className="item" key={index}>
								<img
									className="gif-image"
									src={image}
									onClick={() => {
										setSelectedImage(image);
										// console.log("selected", selectedImage);
									}}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
};

export default GifSearch;
