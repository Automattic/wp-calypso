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
 * @param {Number} commentId Comment ID.
 * @return {Object} An array of replies for the specified comment.
 */
export default createSelector(
	( state, siteId, commentId ) => filter(
		get( state, [ 'discussions', 'items', siteId ] ),
		{ parent: { ID: commentId } }
	),
	state => [ get( state, 'discussions.items', null ) ]
);
