/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { changeReviewStatus } from 'woocommerce/state/sites/reviews/actions';
import { clearReviewReplyEdits } from 'woocommerce/state/ui/review-replies/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { fetchReviewReplies } from 'woocommerce/state/sites/review-replies/actions';
import { getReview } from 'woocommerce/state/sites/reviews/selectors';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
	WOOCOMMERCE_REVIEW_REPLIES_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_CREATE_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_DELETE_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_DELETED,
	WOOCOMMERCE_REVIEW_REPLY_UPDATE_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_UPDATED,
} from 'woocommerce/state/action-types';

export function handleReviewRepliesRequest( action ) {
	const { siteId, reviewId } = action;
	return request( siteId, action, '/wp/v2' ).get(
		`comments?parent=${ reviewId }&order=asc&per_page=15`
	);
}

export function handleReviewRepliesRequestSuccess( action, { data } ) {
	const { siteId, reviewId } = action;

	return {
		type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
		siteId,
		reviewId,
		replies: data,
	};
}

export function handleReviewRepliesRequestError( action, error ) {
	const { siteId, reviewId } = action;
	return {
		type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
		siteId,
		reviewId,
		error,
	};
}

export function handleReviewReplyCreate( action ) {
	const { siteId, reviewId, replyText } = action;

	// TODO - Update to use /wp/v2/comments again if possible. POST `/wp/v2/comments`
	// has been timing out on creates for a couple test sites, so we will use the .com endpoint in the meantime.
	return http( {
		method: 'POST',
		apiVersion: '1.1',
		path: `/sites/${ siteId }/comments/${ reviewId }/replies/new`,
		body: {
			content: replyText,
		},
		onSuccess: action,
		onFailure: action,
	} );
}

export function handleReviewReplyCreateSuccess( action ) {
	return ( dispatch, getState ) => {
		const { siteId, productId, reviewId, shouldApprove } = action;
		const state = getState();

		dispatch( fetchReviewReplies( siteId, reviewId ) );

		const review = getReview( state, reviewId, siteId );
		if ( shouldApprove && review ) {
			dispatch( changeReviewStatus( siteId, productId, reviewId, review.status, 'approved' ) );
		}
	};
}

export function announceCreateFailure() {
	return errorNotice( translate( "Your reply couldn't be posted." ), { duration: 5000 } );
}

export function handleDeleteReviewReply( action ) {
	const { siteId, replyId } = action;
	return request( siteId, action, '/wp/v2' ).del( `comments/${ replyId }?force=true` );
}

export function announceDeleteSuccess( action ) {
	const { siteId, reviewId, replyId } = action;

	return [
		{
			type: WOOCOMMERCE_REVIEW_REPLY_DELETED,
			siteId,
			reviewId,
			replyId,
		},
		successNotice( translate( 'Reply deleted.' ), { duration: 5000 } ),
	];
}

export function announceDeleteFailure() {
	return errorNotice( translate( "We couldn't delete this reply." ), { duration: 5000 } );
}

export function handleReviewReplyUpdate( action ) {
	const { siteId, replyId, changes } = action;
	return request( siteId, action, '/wp/v2' ).post( `comments/${ replyId }`, changes );
}

export function handleReviewReplyUpdateSuccess( action, { data } ) {
	const { siteId, reviewId, replyId } = action;

	return [
		{
			type: WOOCOMMERCE_REVIEW_REPLY_UPDATED,
			siteId,
			reviewId,
			replyId,
			reply: data,
		},
		clearReviewReplyEdits( siteId ),
		successNotice( translate( 'Reply updated.' ), {
			duration: 5000,
		} ),
	];
}

export function announceReviewReplyUpdateFailure() {
	return successNotice( translate( "We couldn't update this reply." ), {
		duration: 5000,
	} );
}

export default {
	[ WOOCOMMERCE_REVIEW_REPLIES_REQUEST ]: [
		dispatchRequest( {
			fetch: handleReviewRepliesRequest,
			onSuccess: handleReviewRepliesRequestSuccess,
			onError: handleReviewRepliesRequestError,
		} ),
	],
	[ WOOCOMMERCE_REVIEW_REPLY_CREATE_REQUEST ]: [
		dispatchRequest( {
			fetch: handleReviewReplyCreate,
			onSuccess: handleReviewReplyCreateSuccess,
			onError: announceCreateFailure,
		} ),
	],
	[ WOOCOMMERCE_REVIEW_REPLY_DELETE_REQUEST ]: [
		dispatchRequest( {
			fetch: handleDeleteReviewReply,
			onSuccess: announceDeleteSuccess,
			onError: announceDeleteFailure,
		} ),
	],
	[ WOOCOMMERCE_REVIEW_REPLY_UPDATE_REQUEST ]: [
		dispatchRequest( {
			fetch: handleReviewReplyUpdate,
			onSuccess: handleReviewReplyUpdateSuccess,
			onError: announceReviewReplyUpdateFailure,
		} ),
	],
};
