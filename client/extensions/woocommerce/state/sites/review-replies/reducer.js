/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_REVIEW_REPLIES_UPDATED } from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_REVIEW_REPLIES_UPDATED ]: repliesUpdated,
} );

export function repliesUpdated( state, action ) {
	const { reviewId, replies, error } = action;
	const existingReplies = state || {};

	if ( error || ! replies ) {
		return { ...existingReplies };
	}

	return {
		...existingReplies,
		[ reviewId ]: replies,
	};
}
