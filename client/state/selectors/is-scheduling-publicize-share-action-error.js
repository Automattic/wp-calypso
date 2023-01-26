import { get } from 'lodash';

/**
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @returns {boolean} true if publicize scheduling share action for a post has failed
 */
export default function isSchedulingPublicizeShareActionError( state, siteId, postId ) {
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
		) === 'failure'
	);
}
