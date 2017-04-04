/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
} from 'state/action-types';

export function receiveRevisions( siteId, postId, revisions ) {
	// NOTE: We expect all revisions to be on the same post, thus highly
	// coupling it to how the WP-API returns revisions, instead of being able
	// to "receive" large (possibly unrelated) batch of revisions.

	return {
		type: POST_REVISIONS_RECEIVE,
		siteId,
		postId,
		revisions
	};
}

export function requestSitePostRevisions( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_REVISIONS_REQUEST,
			siteId,
			postId
		} );

		const query = {
			apiNamespace: 'wp/v2'
		};

		return wpcom.req.get( `/sites/${ siteId }/posts/${ postId }/revisions`, query )
			.then( ( revisions ) => {
				dispatch( receiveRevisions( siteId, postId, revisions ) );
				dispatch( {
					type: POST_REVISIONS_REQUEST_SUCCESS,
					siteId,
					postId
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: POST_REVISIONS_REQUEST_FAILURE,
					siteId,
					postId,
					error
				} );
			} );
	};
}
