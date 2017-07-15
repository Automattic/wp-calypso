/**
 * Internal dependencies
 */
import {
	DRAFT_FEEDBACK_SHARE_ADD,
	DRAFT_FEEDBACK_SHARE_REMOVE,
	DRAFT_FEEDBACK_SHARE_REVOKE,
	DRAFT_FEEDBACK_SHARE_RESTORE,
	DRAFT_FEEDBACK_COMMENT_ADD,
} from 'state/action-types';

/**
 * Shares a draft with the specified person.
 *
 * @param 	{Number} 	siteId 			Site ID
 * @param 	{Number} 	postId 			Post ID
 * @param 	{string} 	emailAddress	Email address of the person with whom we are sharing the draft
 * @return 	{Object}   					Action object
 */
export function addDraftShare( siteId, postId, emailAddress ) {
	return {
		type: DRAFT_FEEDBACK_SHARE_ADD,
		siteId,
		postId,
		emailAddress,
	};
}

/**
 * Stops sharing a draft with the specified person.
 *
 * This action stops sharing a draft with the specified person.
 * This actions exists to support optimistic state updates and correcting
 * our state in the event that creating a share fails.
 *
 * @param 	{Number}	siteId 			Site ID
 * @param 	{Number} 	postId 			Post ID
 * @param 	{string} 	emailAddress	Email address of the person with whom we are sharing the draft
 * @return 	{Object}   					Action object
 */
export function removeDraftShare( siteId, postId, emailAddress ) {
	return {
		type: DRAFT_FEEDBACK_SHARE_REMOVE,
		siteId,
		postId,
		emailAddress,
	};
}

/**
 * Revokes the ability of the specified person to offer feedback on the draft.
 *
 * This action revokes the ability of the specified person to offer feedback
 * on the draft but *preserves existing feedback* from that person.
 *
 * @param 	{Number} 	siteId 			Site ID
 * @param 	{Number} 	postId 			Post ID
 * @param 	{string} 	emailAddress	Email address of the person with whom we are sharing the draft
 * @return 	{Object}   					Action object
 */
export function revokeDraftShare( siteId, postId, emailAddress ) {
	return {
		type: DRAFT_FEEDBACK_SHARE_REVOKE,
		siteId,
		postId,
		emailAddress,
	};
}

/**
 * Restores the ability of the specified person to offer feedback on the draft.
 *
 * @param 	{Number} 	siteId 			Site ID
 * @param 	{Number} 	postId 			Post ID
 * @param 	{string} 	emailAddress	Email address of the person with whom we are sharing the draft
 * @return 	{Object}   					Action object
 */
export function restoreDraftShare( siteId, postId, emailAddress ) {
	return {
		type: DRAFT_FEEDBACK_SHARE_RESTORE,
		siteId,
		postId,
		emailAddress,
	};
}

/**
 * Adds feedback from the specified person.
 *
 * @param 	{Number} 	siteId 			Site ID
 * @param 	{Number} 	postId 			Post ID
 * @param 	{string} 	emailAddress	Email address of the person with whom we are sharing the draft
 * @param	{string}	comment			A comment containing feedback for the post
 * @return 	{Object}   					Action object
 */
export function addDraftShareFeedback( siteId, postId, emailAddress, comment ) {
	return {
		type: DRAFT_FEEDBACK_COMMENT_ADD,
		siteId,
		postId,
		emailAddress,
		comment,
	};
}
