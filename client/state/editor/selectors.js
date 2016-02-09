/**
 * Internal dependencies
 */
import { getPost } from 'state/posts/selectors';

export function getCurrentPostGlobalId( state ) {
	return state.editor.currentPostGlobalId;
}

export function isLoadingCurrentPost( state ) {
	return isLoadingPost( state, getCurrentPostGlobalId( state ) );
}

export function isLoadingPost( state, globalId ) {
	return Array.isArray( globalId );
}

export function getEditedPost( state, globalId ) {
	const post = getPost( state, globalId );
	const edits = state.editor.posts[ globalId ];
	return Object.assign( {}, post, edits );
}
