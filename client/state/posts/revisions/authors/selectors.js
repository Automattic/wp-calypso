/**
 * Returns an author (user) object by ID.
 *
 *
 * @format
 * @param {Number} userId User ID
 * @return {Object}        User object
 */

export function getPostRevisionAuthor( state, userId ) {
	return state.posts.revisions.authors.items[ userId ];
}
