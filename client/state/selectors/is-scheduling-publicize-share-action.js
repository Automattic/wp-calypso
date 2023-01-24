import { get } from 'lodash';

/**
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @returns {boolean} true if we are scheduling publicize share action for a post
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
