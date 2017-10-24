/** @format */
/**
 * Internal dependencies
 */
import {
	COMMENTS_CLEAR_SELECTED,
	COMMENTS_SELECT_ALL,
	COMMENTS_TOGGLE_SELECTED,
} from 'state/action-types';

export const clearSelectedComments = siteId => ( {
	type: COMMENTS_CLEAR_SELECTED,
	siteId,
} );

export const selectAllComments = ( siteId, comments ) => ( {
	type: COMMENTS_SELECT_ALL,
	siteId,
	comments,
} );

export const toggleSelectedComment = ( siteId, postId, commentId ) => ( {
	type: COMMENTS_TOGGLE_SELECTED,
	siteId,
	postId,
	commentId,
} );
