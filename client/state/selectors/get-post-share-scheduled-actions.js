/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { enrichPublicizeActionsWithConnections } from 'state/selectors/utils/';

/**
 * Return a share-scheduled-actions array propagaring data from publicize connections.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {Array} share publihed actions array
 */
export default function getPostShareScheduledActions( state, siteId, postId ) {
	const postShareActions = get( state, [ 'sharing', 'publicize', 'sharePostActions', 'scheduled', siteId, postId ], [] );
	return enrichPublicizeActionsWithConnections( state, postShareActions );
}
