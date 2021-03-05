/**
 * External dependencies
 */

import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [reviewId] Review to get data for.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array|false} Array of replies, or false if no list could be loaded.
 */
export const getReviewReplies = ( state, reviewId, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'reviewReplies', reviewId ],
		false
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [reviewId] Review to fetch replies for.
 * @param {object} [replyId] Reply ID to get data for.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object|false} Reply object, or false if no reply could be loaded.
 */
export const getReviewReply = ( state, reviewId, replyId, siteId = getSelectedSiteId( state ) ) => {
	const replies = getReviewReplies( state, reviewId, siteId );
	return find( replies, { id: replyId } ) || false;
};
