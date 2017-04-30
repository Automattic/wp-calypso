/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * @param {Object} state Global app state
 * @param {Number} siteId Site ID.
 * @param {Number} commentId Comment ID.
 * @return {Object} An object representing the requested comment.
 */
export default createSelector(
	( state, siteId, commentId ) => get( state, [ 'discussions', 'items', siteId, commentId ], null )
);
