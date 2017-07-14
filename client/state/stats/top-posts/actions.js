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
 * Returns an action object to be used in signaling that the top posts for a
 * period, a number of periods and a date have been received.
 *
 * @param  {Number} siteId      Site ID
 * @param  {String} date        Most recent day included
 * @param  {String} period      Period received (day, week, month, year)
 * @param  {Number} num         Number of periods included
 * @param  {Object} postsByDay  Posts received
 * @return {Object}             Action object
 */
export function receiveTopPosts( siteId, date, period, num, postsByDay ) {
	return {
		type: TOP_POSTS_RECEIVE,
		siteId,
		date,
		period,
		num,
		postsByDay,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve the top posts for a site and period.
 *
 * @param  {Number} siteId Site ID
 * @param  {String} date   Most recent day to include
 * @param  {String} period Period to fetch (day, week, month, year) (default: day)
 * @param  {num} num       Number of periods to include (default: 1)
 * @return {Function}      Action thunk
 */
export function requestTopPosts( siteId, date, period = 'day', num = 1 ) {
	return dispatch => {
		dispatch( {
			type: TOP_POSTS_REQUEST,
			siteId,
			date,
			period,
			num,
		} );

		return wpcom
			.site( siteId )
			.statsTopPosts( { date, period, num } )
			.then( data => {
				// Converts total_views from string to integer
				const days = Object.entries( data.days ).reduce( ( result, day ) => {
					result[ day[ 0 ] ] = {
						...day[ 1 ],
						total_views: parseInt( day[ 1 ].total_views, 10 ),
					};
					return result;
				}, {} );

				dispatch( receiveTopPosts( siteId, date, period, num, days ) );
				dispatch( {
					type: TOP_POSTS_REQUEST_SUCCESS,
					siteId,
					date,
					period,
					num,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: TOP_POSTS_REQUEST_FAILURE,
					siteId,
					date,
					period,
					num,
					error,
				} );
			} );
	};
}
