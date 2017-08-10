/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {Boolean} true if we are scheduling publicize share action for a post
 */
export default function isSchedulingPublicizeShareAction( state, siteId, postId ) {
	return (
		get(
			state,
			[
				'sharing',
				'publicize',
				'sharePostActions',
				'schedulingSharePostActionStatus',
				siteId,
				postId,
				'status',
			],
			false
		) === 'requesting'
	);
}
