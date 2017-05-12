/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { enrichPublicizeActionsWithConnections } from 'state/selectors/utils/';

/**
 * Return a share-published-actions array propagaring data from publicize connections.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Shared Post ID
 * @return {Array} share scheduled actions array
 */
export default function getPostSharePublishedActions( state, siteId, postId ) {
	const postShareActions = get( state, [ 'sharing', 'publicize', 'sharePostActions', 'published', siteId, postId ], [] );
	return enrichPublicizeActionsWithConnections( state, postShareActions );
}
