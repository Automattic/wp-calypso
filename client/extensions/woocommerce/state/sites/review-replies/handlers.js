/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { WOOCOMMERCE_REVIEW_REPLIES_UPDATED, WOOCOMMERCE_REVIEW_REPLIES_REQUEST } from 'woocommerce/state/action-types';
import request from 'woocommerce/state/sites/http-request';

export default {
	[ WOOCOMMERCE_REVIEW_REPLIES_REQUEST ]: [ dispatchRequest(
		handleReviewRepliesRequest,
		handleReviewRepliesRequestSuccess,
		handleReviewRepliesRequestError
	) ],
};

export function handleReviewRepliesRequest( { dispatch }, action ) {
	const { siteId, reviewId } = action;
	dispatch( request( siteId, action, '/wp/v2' ).get( `comments?parent=${ reviewId }&per_page=15` ) );
}

export function handleReviewRepliesRequestSuccess( { dispatch }, action, { data } ) {
	const { siteId, reviewId } = action;

	dispatch( {
		type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
		siteId,
		reviewId,
		replies: data,
	} );
}

export function handleReviewRepliesRequestError( { dispatch }, action, error ) {
	const { siteId, reviewId } = action;
	dispatch( {
		type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
		siteId,
		reviewId,
		error,
	} );
}
