
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
	'noobs2ninjas',
	'brunofin'
];

function getTwitchURL(resource, streamer) {
	return `https://api.twitch.tv/kraken/${resource}/${streamer}`;
}

function getStreamersFromArray(streamers) {
	return Rx.Observable.from(streamers);
}

function handleNetworkError(streamer) {
	return Rx.Observable.just({
		logo: 'https://placehold.it/300x300',
		display_name: streamer,
		url: '#',
		status: 'This channel no longer exists',
		isOnline: false,
		_links: {
			self: '#',
			channel: '#'
		}
	});
}

function getChannelsData(streamer) {
	return Rx.DOM.getJSON(getTwitchURL('channels', streamer))
		.catch(() => handleNetworkError(streamer));
}

function getStreamsData(streamer) {
	return Rx.DOM.getJSON(getTwitchURL('streams', streamer))
		.catch(() => handleNetworkError(streamer));
}

function generateChannelElement({ logo,	displayName, url, status, isOnline }) {

	const onlineStatus = isOnline ?
		'<span class="tag is-success">Online</span>' : '<span class="tag is-danger">Offline</span>';

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
							<strong><a href="${url}">${displayName}</a></strong>
							<br>
							<small>${url}</small>
							<br>
							${status || 'No status'}
						</p>
					</div>
					<nav class="level">
						<div class="level-left">${onlineStatus}</div>
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
	const container = document.querySelector('.js-streams');
	container.innerHTML = '';

	streams.forEach(stream => container.appendChild(generateChannelElement(stream)));

	return container;
}

function failureSubscription(error) {
	console.error('Something went wrong', error);
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
	return responses[0].map(stream => {
		return {
			...responses[1].find(channel => channel.channelId === stream.channelId),
			...stream
		};
	});
}

const streams$ = getStreamersFromArray(STREAMERS)
	.flatMap(getStreamsData)
	.map(filterStreamsResponse)
	.toArray();

const channels$ = getStreamersFromArray(STREAMERS)
	.flatMap(getChannelsData)
	.map(filterChannelsResponse)
	.toArray();

Rx.Observable
	.forkJoin(streams$, channels$)
	.map(mergeResponses)
	.subscribe(successSubscription, failureSubscription);
