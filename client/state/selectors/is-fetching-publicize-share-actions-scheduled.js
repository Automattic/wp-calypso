/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @return {Boolean} true if we are fetching publicize share actions for a post
 */
export default function isFetchingPublicizeShareActionsScheduled( state, siteId, postId ) {
	return get( state, [ 'sharing', 'sharePostActions', 'scheduled', siteId, postId ], false );
}
