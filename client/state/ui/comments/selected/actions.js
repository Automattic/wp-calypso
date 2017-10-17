/** @format */
/**
 * Internal dependencies
 */
import { COMMENTS_SELECT, COMMENTS_DESELECT } from 'state/action-types';

export const selectComment = ( siteId, commentId ) => ( {
	type: COMMENTS_SELECT,
	siteId,
	commentId,
} );

export const deselectComment = ( siteId, commentId ) => ( {
	type: COMMENTS_DESELECT,
	siteId,
	commentId,
} );
