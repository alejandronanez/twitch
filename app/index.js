
import Rx from 'rx';
import 'rx-dom';

const STREAMERS = [
	'ESL_SC2',
	'OgamingSC2',
	'cretetion',
	'freecodecamp',
	'storbeck',
	'habathcx',
	'RobotCaleb',
	'noobs2ninjas'
];

function getStreamersFromArray(streamers) {
	return Rx.Observable.from(streamers);
}

function getApiData(streamer) {
	return Rx.DOM.getJSON(`https://api.twitch.tv/kraken/streams/${streamer}`);
}

// function generateChannelElement(data) {
// 	const template = `
// 		<div class="box stream">
// 			<article class="media">
// 				<div class="media-left">
// 					<figure class="image is-128x128">
// 						<img src="https://placeimg.com/128/128/tech" alt="Image">
// 					</figure>
// 				</div>
// 				<div class="media-content">
// 					<div class="content">
// 						<p>
// 							<strong><a href="" target="_blank">John Smith</a></strong>
// 							<br>
// 							<small>twitch.tv/johnsmith</small>
// 							<br>
// 							Lorem ipsum dolor sit amet,
// 						</p>
// 					</div>
// 					<nav class="level">
// 						<div class="level-left">
// 							<span class="tag is-success">Online</span> /
// 							<span class="tag is-danger">Offline</span>
// 						</div>
// 					</nav>
// 				</div>
// 			</article>
// 		</div>
// 	`;

// 	const element = document.createElement('div');
// 	element.classList = 'box stream';
// 	element.innerHTML = template;

// 	return element;
// }

function successSubscription(stream) {
	console.log('Stream: ', stream);
}

function failureSubscription(error) {
	Error('Something went wrong', error);
}

const responseStream = getStreamersFromArray(STREAMERS).flatMap(getApiData).toArray();

responseStream.subscribe(successSubscription, failureSubscription);
