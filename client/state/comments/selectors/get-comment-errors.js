/**
 * Internal dependencies
 */
import 'calypso/state/comments/init';

export function getCommentErrors( state ) {
	return state.comments.errors;
}
