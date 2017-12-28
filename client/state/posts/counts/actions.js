/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'client/lib/wp';
import {
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
	POST_COUNTS_REQUEST_SUCCESS,
	POST_COUNTS_REQUEST_FAILURE,
} from 'client/state/action-types';

/**
 * Returns an action object signalling that post counts have been received for
 * the site and post type.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} postType Post type
 * @param  {Object} counts   Mapping of post status to count
 * @return {Object}          Action object
 */
export function receivePostCounts( siteId, postType, counts ) {
	return {
		type: POST_COUNTS_RECEIVE,
		siteId,
		postType,
		counts,
	};
}

/**
 * Returns an action thunk, dispatching progress of a request to retrieve post
 * counts for a site and post type.
 *
 * @param  {Number}   siteId   Site ID
 * @param  {String}   postType Post type
 * @return {Function}          Action thunk
 */
export function requestPostCounts( siteId, postType ) {
	return dispatch => {
		dispatch( {
			type: POST_COUNTS_REQUEST,
			postType,
			siteId,
		} );

		return wpcom
			.undocumented()
			.site( siteId )
			.postCounts( {
				type: postType,
			} )
			.then( data => {
				dispatch( receivePostCounts( siteId, postType, data.counts ) );
				dispatch( {
					type: POST_COUNTS_REQUEST_SUCCESS,
					siteId,
					postType,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: POST_COUNTS_REQUEST_FAILURE,
					siteId,
					postType,
					error,
				} );
			} );
	};
}
