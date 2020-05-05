/**
 * Internal dependencies
 */
import 'state/comments/init';

export function getCommentErrors( state ) {
	return state.comments.errors;
}
