/**
 * @format
 */

/**
 * External Dependencies
 */
import { merge } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_REMEMBERED_POSTS_Forget } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { updateRememberedPostStatus } from 'state/reader/remembered-posts/actions';
import { bypassDataLayer } from 'state/data-layer/utils';
import getReaderRememberedPostStatus from 'state/selectors/get-reader-remembered-post-status';

export function requestForgetPost( { dispatch, getState }, action ) {
	const actionWithRevert = merge( {}, action, {
		meta: {
			previousState: getReaderRememberedPostStatus( getState(), {
				siteId: action.payload.siteId,
				postId: action.payload.postId,
			} ),
		},
	} );
	dispatch(
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: `/read/sites/${ action.payload.siteId }/posts/${ action.payload.postId }/forget`,
				body: {}, // have to have an empty body to make wpcom-http happy
			},
			actionWithRevert
		)
	);
}

export function receiveForgetPost( store, action, response ) {
	// validate that it worked
	const isFollowing = !! ( response && response.success );
	if ( ! isFollowing ) {
		receiveForgetPostError( store, action );
		return;
	}

	store.dispatch(
		successNotice( translate( 'The post has been successfully remembered.' ), {
			duration: 5000,
		} )
	);
}

export function receiveForgetPostError(
	{ dispatch },
	{ payload: { siteId, postId }, meta: { previousState } }
) {
	dispatch(
		errorNotice( translate( 'Sorry, we had a problem remembering that post. Please try again.' ) )
	);

	dispatch(
		bypassDataLayer(
			updateRememberedPostStatus( {
				siteId,
				postId,
				status: previousState,
			} )
		)
	);
}

export default {
	[ READER_REMEMBERED_POSTS_Forget ]: [
		dispatchRequest( requestForgetPost, receiveForgetPost, receiveForgetPostError ),
	],
};
