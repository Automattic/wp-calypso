/**
 * External dependencies
 */
import {
	filter,
	get
} from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * @param {Object} state Global app state
 * @param {Number} siteId Site ID.
 * @param {Number} postId Post ID.
 * @return {Object} An array of comments for the specified post.
 */
export default createSelector(
	( state, siteId, postId ) => filter(
		get( state, [ 'discussions', 'items', siteId ], null ),
		{ post: { ID: postId }, parent: false }
	),
	state => [ get( state, 'discussions.items', null ) ]
);
