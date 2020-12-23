/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	POST_REQUEST_FAILURE,
	POST_REQUEST_SUCCESS,
	POST_REQUEST,
} from 'calypso/state/action-types';
import { receivePost } from 'calypso/state/posts/actions/receive-post';

import 'calypso/state/posts/init';

/**
 * Triggers a network request to fetch a specific post from a site.
 *
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @param {object} query Query object passed to wpcom.site.post.get
 * @returns {Function}        Action thunk
 */
export function requestSitePost( siteId, postId, query = {} ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_REQUEST,
			siteId,
			postId,
		} );

		return wpcom
			.site( siteId )
			.post( postId )
			.get( query )
			.then( ( post ) => {
				dispatch( receivePost( post ) );
				dispatch( {
					type: POST_REQUEST_SUCCESS,
					siteId,
					postId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: POST_REQUEST_FAILURE,
					siteId,
					postId,
					error,
				} );
			} );
	};
}
