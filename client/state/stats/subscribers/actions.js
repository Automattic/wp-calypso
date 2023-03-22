import {
	STATS_SUBSCRIBERS_RECEIVE,
	STATS_SUBSCRIBERS_REQUEST,
	STATS_SUBSCRIBERS_REQUEST_SUCCESS,
	STATS_SUBSCRIBERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import 'calypso/state/stats/init';

export function selectStatSubscribersRequest( siteId ) {
	return { type: STATS_SUBSCRIBERS_REQUEST, siteId };
}

export function selectStatSubscribersRequestSuccess( siteId ) {
	return { type: STATS_SUBSCRIBERS_REQUEST_SUCCESS, siteId };
}
