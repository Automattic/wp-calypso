/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {Boolean} true if publicize scheduling share action for a post has failed
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
