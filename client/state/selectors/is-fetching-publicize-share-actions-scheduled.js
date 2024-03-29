import { get } from 'lodash';

import 'calypso/state/sharing/init';

/**
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @returns {boolean} true if we are fetching publicize share actions for a post
 */
export default function isFetchingPublicizeShareActionsScheduled( state, siteId, postId ) {
	return get( state, [ 'sharing', 'sharePostActions', 'scheduled', siteId, postId ], false );
}
