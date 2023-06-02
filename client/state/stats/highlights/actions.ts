import { STATS_HIGHLIGHTS_REQUEST, STATS_HIGHLIGHTS_RECEIVE } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/highlights';
import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve stats highlights data.
 *
 * @param  {number}  siteId Site ID
 * @returns {Object}  Action object
 */

export function requestHighlights( siteId: number ) {
	return {
		type: STATS_HIGHLIGHTS_REQUEST,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a visitor count object has
 * been received.
 *
 * @param {number} siteId Site ID
 * @param {Object} data   API response
 * @returns {Object}  Action object
 */
export function receiveHighlights( siteId: number, data: object ) {
	return {
		type: STATS_HIGHLIGHTS_RECEIVE,
		siteId,
		data,
	};
}
