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
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post Id
 * @param  {Array}  stats  The received stats
 * @return {Object}        Action object
 */
export function receivePostStats( siteId, postId, stats ) {
	return {
		type: POST_STATS_RECEIVE,
		siteId,
		postId,
		stats,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve post stat for a site and a post.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post Id
 * @param  {String} fields Stat Fields to fetch
 * @return {Function}      Action thunk
 */
export function requestPostStats( siteId, postId, fields = [] ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_STATS_REQUEST,
			postId,
			siteId,
			fields
		} );

		return wpcom.site( siteId )
			.statsPostViews( postId, { fields: fields.join() } )
			.then( stats => {
				dispatch( receivePostStats( siteId, postId, stats ) );
				dispatch( {
					type: POST_STATS_REQUEST_SUCCESS,
					siteId,
					postId,
					fields
				} );
			} )
			.catch( error => {
				dispatch( {
					type: POST_STATS_REQUEST_FAILURE,
					siteId,
					postId,
					fields,
					error
				} );
			} );
	};
}
