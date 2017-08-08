/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	TOP_POSTS_RECEIVE,
	TOP_POSTS_REQUEST,
	TOP_POSTS_REQUEST_FAILURE,
	TOP_POSTS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns an action object to be used in signaling that
 * the top posts for a query has been received.
 *
 * @param  {Number} siteId      Site ID
 * @param  {Ojbect} query       Top posts query parameters
 * @param  {Object} postsByDay  Posts received, grouped by days
 * @return {Object}             Action object
 */
export function receiveTopPosts( siteId, query, postsByDay ) {
	return {
		type: TOP_POSTS_RECEIVE,
		siteId,
		query,
		postsByDay,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve the top posts for a site and query.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} query  Top posts query parameters
 * @return {Function}      Action thunk
 */
export function requestTopPosts( siteId, query = {} ) {
	return dispatch => {
		dispatch( {
			type: TOP_POSTS_REQUEST,
			siteId,
			query,
		} );

		return wpcom
			.site( siteId )
			.statsTopPosts( { ...query } )
			.then( data => {
				// Converts total_views from string to integer
				const days = Object.entries( data.days ).reduce( ( result, day ) => {
					result[ day[ 0 ] ] = {
						...day[ 1 ],
						total_views: parseInt( day[ 1 ].total_views, 10 ),
					};
					return result;
				}, {} );

				dispatch( receiveTopPosts( siteId, query, days ) );
				dispatch( {
					type: TOP_POSTS_REQUEST_SUCCESS,
					siteId,
					query,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: TOP_POSTS_REQUEST_FAILURE,
					siteId,
					query,
					error,
				} );
			} );
	};
}
