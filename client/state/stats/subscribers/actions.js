import {
	STATS_SUBSCRIBERS_RECEIVE,
	STATS_SUBSCRIBERS_REQUEST,
	STATS_SUBSCRIBERS_REQUEST_SUCCESS,
	STATS_SUBSCRIBERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import 'calypso/state/stats/init';

export function requestStatSubscribers( siteId ) {
	return { type: STATS_SUBSCRIBERS_REQUEST, siteId };
}

export function receiveStatSubscribers( siteId, data ) {
	return { type: STATS_SUBSCRIBERS_RECEIVE, siteId, data };
}

export function requestStatSubscribersSuccess( siteId ) {
	return { type: STATS_SUBSCRIBERS_REQUEST_SUCCESS, siteId };
}

export function requestStatSubscribersFailure( siteId ) {
	return { type: STATS_SUBSCRIBERS_REQUEST_FAILURE, siteId };
}
