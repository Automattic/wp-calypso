/**
 * Internal dependencies
 */
import 'calypso/state/posts/init';

/**
 * Returns an author (user) object by ID.
 *
 * @param {any} state Redux state
 * @param {number} userId User ID
 * @returns {object}        User object
 */
export function getPostRevisionAuthor( state, userId ) {
	return state.posts.revisions.authors.items[ userId ];
}
