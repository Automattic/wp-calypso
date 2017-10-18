/** @format */
/**
 * Internal dependencies
 */
import { COMMENTS_TOGGLE_SELECT } from 'state/action-types';

export const toggleSelectedComment = ( siteId, commentId ) => ( {
	type: COMMENTS_TOGGLE_SELECT,
	siteId,
	commentId,
} );
