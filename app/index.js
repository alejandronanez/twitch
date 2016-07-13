
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

function getTwitchURL(resource, streamer) {
	return `https://api.twitch.tv/kraken/${resource}/${streamer}`;
}

function getStreamersFromArray(streamers) {
	return Rx.Observable.from(streamers);
}

function getChannelsData(streamer) {
	return Rx.DOM.getJSON(getTwitchURL('channels', streamer));
}

function getStreamsData(streamer) {
	return Rx.DOM.getJSON(`https://api.twitch.tv/kraken/streams/${streamer}`);
}

function generateChannelElement({ logo,	displayName, url, status }) {

	const template = `
		<div class="box stream">
			<article class="media">
				<div class="media-left">
					<figure class="image is-128x128">
						<img src=${logo} alt="Image">
					</figure>
				</div>
				<div class="media-content">
					<div class="content">
						<p>
							<strong><a href="" target="_blank">${displayName}</a></strong>
							<br>
							<small>${url}</small>
							<br>
							${status || 'No status'}
						</p>
					</div>
					<nav class="level">
						<div class="level-left">
							<span class="tag is-success">Online</span> /
							<span class="tag is-danger">Offline</span>
						</div>
					</nav>
				</div>
			</article>
		</div>
	`;

	const element = document.createElement('div');
	element.innerHTML = template;

	return element;
}

function successSubscription(streams) {
	console.log(streams);
	const container = document.querySelector('.js-streams');
	container.innerHTML = '';

	streams.forEach(stream => container.appendChild(generateChannelElement(stream)));

	return container;
}

function failureSubscription(error) {
	Error('Something went wrong', error);
}

function getAllStreamsResponseData({ logo, display_name, url, status, name }) {

	return {
		displayName: display_name,
		logo,
		url,
		status,
		name
	};
}

function filterStreamsResponse({ stream, _links }) {
	return {
		isOnline: !!stream,
		channelId: _links.channel.toLowerCase()
	};
}

function filterChannelsResponse({ display_name, status, url, logo, _links }) {
	return {
		displayName: display_name,
		status,
		url,
		logo,
		channelId: _links.self
	};
}

function mergeResponses(responses) {
	const streamResponses = responses[0];
	const channelResponses = responses[1];

	const r = streamResponses.map(response => {
		debugger;
		return [].concat(
			response.find(r => r.channelId === response.channelId)
		)
	});

	debugger;
}

const streams$ = getStreamersFromArray(STREAMERS)
	.flatMap(getStreamsData)
	.map(filterStreamsResponse)
	.toArray();

const channels$ = getStreamersFromArray(STREAMERS)
	.flatMap(getChannelsData)
	.map(filterChannelsResponse)
	.toArray();

const response$ = Rx.Observable
	.forkJoin(streams$, channels$)
	.map(mergeResponses)
	.subscribe(x => console.debug(x))

// const response$ = Rx.Observable
// 	.forkJoin(streams$, channels$)
// 	.subscribe((x) => console.log(x));
