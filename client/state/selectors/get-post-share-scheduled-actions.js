/**
 * External dependencies
 */
import { get, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { enrichPublicizeActionsWithConnections } from 'state/selectors/utils/';

const getScheduledActions = ( state, siteId, postId ) => ( orderBy( get(
	state,
	[ 'sharing', 'publicize', 'sharePostActions', 'scheduled', siteId, postId ],
	[],
), [ 'ID' ], [ 'desc' ] ) );

/**
 * Return a share-scheduled-actions array propagaring data from publicize connections.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {Array} share publihed actions array
 */
const getPostShareScheduledActions = createSelector(
	( state, siteId, postId ) => {
		const postShareActions = getScheduledActions( state, siteId, postId );
		return enrichPublicizeActionsWithConnections( state, postShareActions );
	},
	( state, siteId, postId ) => getScheduledActions( state, siteId, postId )
);

export default getPostShareScheduledActions;
