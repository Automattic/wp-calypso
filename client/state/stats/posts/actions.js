/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_FAILURE,
	POST_STATS_REQUEST_SUCCESS
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that post stat for a site,
 * post and stat have been received.
 *
 * @param  {String} stat   Stat Key
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post Id
 * @param  {Number} value  The stat value
 * @return {Object}        Action object
 */
export function receivePostStat( stat, siteId, postId, value ) {
	return {
		type: POST_STATS_RECEIVE,
		stat,
		siteId,
		postId,
		value
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve post stat for a site and a post.
 *
 * @param  {String} stat   Stat Key
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post Id
 * @return {Function}      Action thunk
 */
export function requestPostStat( stat, siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_STATS_REQUEST,
			stat,
			postId,
			siteId
		} );

		return wpcom.site( siteId ).statsPostViews( postId, {
			fields: stat
		} ).then( data => {
			if ( stat in data ) {
				dispatch( receivePostStat( stat, siteId, postId, data[ stat ] ) );
			}
			dispatch( {
				type: POST_STATS_REQUEST_SUCCESS,
				stat,
				siteId,
				postId
			} );
		} ).catch( error => {
			dispatch( {
				type: POST_STATS_REQUEST_FAILURE,
				stat,
				siteId,
				postId,
				error
			} );
		} );
	};
}
