/**
 * External dependencies
 */
import { get, isObject, merge } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getReviewReply } from 'woocommerce/state/sites/review-replies/selectors';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number|Object} The ID of the review reply (or object placeholder, if a new reply)
 */
export const getCurrentlyEditingReviewReplyId = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'reviewReplies', siteId, 'edits', 'currentlyEditingId' ], null );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number|Object} The ID of the review that a reply edit is associated with.
 */
export const getCurrentlyEditingReviewId = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'reviewReplies', siteId, 'edits', 'reviewId' ], null );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The local edits made to the reply.
 */
export const getReviewReplyEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'reviewReplies', siteId, 'edits', 'changes' ], {} );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The reply merged with changes, or just the changes if a new reply
 */
export const getReviewReplyWithEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	const reviewId = getCurrentlyEditingReviewId( state, siteId );
	const replyId = getCurrentlyEditingReviewReplyId( state, siteId );
	const reviewEdits = getReviewReplyEdits( state, siteId );

	if ( isObject( replyId ) ) {
		return { ...reviewEdits, id: replyId, parent: reviewId };
	}

	const review = getReviewReply( state, reviewId, replyId, siteId );
	if ( ! review ) {
		return reviewEdits;
	}

	return merge( {}, review, reviewEdits );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} True if there is a reply ID tracked as "editing"
 */
export const isCurrentlyEditingReviewReply = ( state, siteId = getSelectedSiteId( state ) ) => {
	return !! getCurrentlyEditingReviewReplyId( state, siteId );
};
