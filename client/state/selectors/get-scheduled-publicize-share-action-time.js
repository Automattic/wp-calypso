/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {String} time when newly scheduled share action will be published
 */
export default function getScheduledPublicizeShareActionTime( state, siteId, postId ) {
	return get( state,
		[ 'sharing', 'publicize', 'sharePostActions', 'schedulingSharePostActionStatus', siteId, postId, 'shareDate' ],
	false );
}
