/**
 * Internal dependencies
 */
import warn from 'lib/warn';
import { EDITOR_POST_EDIT, EDITOR_EDITING_START } from 'state/action-types';
import { getSitePost } from 'state/posts/selectors';
import { getCurrentPostGlobalId, isLoadingPost } from './selectors';

export function startEditing( siteId, postId ) {
	const action = { type: EDITOR_EDITING_START };
	if ( ! postId ) {
		return Object.assign( action, { siteId } );
	}

	return ( dispatch, getState ) => {
		const post = getSitePost( getState(), siteId, postId );
		if ( post ) {
			Object.assign( action, { globalId: post.globalId } );
		} else {
			Object.assign( action, { siteId, postId } );
		}

		dispatch( action );
	};
}

export function editPost( post, globalId ) {
	return ( dispatch, getState ) => {
		const state = getState();

		if ( ! globalId ) {
			globalId = getCurrentPostGlobalId( state );
		}

		if ( isLoadingPost( state, globalId ) ) {
			warn( 'Wait for post to finish loading before editing' );
			return;
		}

		dispatch( {
			type: EDITOR_POST_EDIT,
			globalId,
			post
		} );
	};
}
