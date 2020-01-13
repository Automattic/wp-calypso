/**
 * Returns an author (user) object by ID.
 *
 *
 * @param {number} userId User ID
 * @returns {object}        User object
 */

export function getPostRevisionAuthor( state, userId ) {
	return state.posts.revisions.authors.items[ userId ];
}
