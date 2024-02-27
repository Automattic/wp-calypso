import {
	STATS_UTM_METRICS_REQUEST,
	STATS_UTM_METRICS_RECEIVE,
	STATS_UTM_METRICS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/utm-metrics';
import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve stats UTM metrics data.
 * @param  {number}  siteId Site ID
 * @returns {Object}  Action object
 */

export function requestMetrics( siteId: number, utmParam: string ) {
	return {
		type: STATS_UTM_METRICS_REQUEST,
		siteId,
		utmParam,
	};
}

export function requestMetricsFail( siteId: number ) {
	return {
		type: STATS_UTM_METRICS_REQUEST_FAILURE,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a top UTM values object has
 * been received.
 * @param {number} siteId Site ID
 * @param {Object} data   API response
 * @returns {Object}  Action object
 */
export function receiveMetrics( siteId: number, data: object ) {
	return {
		type: STATS_UTM_METRICS_RECEIVE,
		siteId,
		data,
	};
}
