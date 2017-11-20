/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { changeReviewStatus } from 'woocommerce/state/sites/reviews/actions';
import { clearReviewReplyEdits } from 'woocommerce/state/ui/review-replies/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { fetchReviewReplies } from 'woocommerce/state/sites/review-replies/actions';
import { getReview } from 'woocommerce/state/sites/reviews/selectors';
import { http } from 'state/data-layer/wpcom-http/actions';
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

export default {
	[ WOOCOMMERCE_REVIEW_REPLIES_REQUEST ]: [
		dispatchRequest(
			handleReviewRepliesRequest,
			handleReviewRepliesRequestSuccess,
			handleReviewRepliesRequestError
		),
	],
	[ WOOCOMMERCE_REVIEW_REPLY_CREATE_REQUEST ]: [
		dispatchRequest(
			handleReviewReplyCreate,
			handleReviewReplyCreateSuccess,
			announceCreateFailure
		),
	],
	[ WOOCOMMERCE_REVIEW_REPLY_DELETE_REQUEST ]: [
		dispatchRequest( handleDeleteReviewReply, announceDeleteSuccess, announceDeleteFailure ),
	],
	[ WOOCOMMERCE_REVIEW_REPLY_UPDATE_REQUEST ]: [
		dispatchRequest(
			handleReviewReplyUpdate,
			handleReviewReplyUpdateSuccess,
			announceReviewReplyUpdateFailure
		),
	],
};

export function handleReviewRepliesRequest( { dispatch }, action ) {
	const { siteId, reviewId } = action;
	dispatch(
		request( siteId, action, '/wp/v2' ).get( `comments?parent=${ reviewId }&order=asc&per_page=15` )
	);
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

export function handleReviewReplyCreate( { dispatch }, action ) {
	const { siteId, reviewId, replyText } = action;

	// TODO - Update to use /wp/v2/comments again if possible. POST `/wp/v2/comments`
	// has been timing out on creates for a couple test sites, so we will use the .com endpoint in the meantime.
	dispatch(
		http( {
			method: 'POST',
			apiVersion: '1.1',
			path: `/sites/${ siteId }/comments/${ reviewId }/replies/new`,
			body: {
				content: replyText,
			},
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function handleReviewReplyCreateSuccess( { dispatch, getState }, action ) {
	const { siteId, productId, reviewId, shouldApprove } = action;
	const state = getState();

	dispatch( fetchReviewReplies( siteId, reviewId ) );

	const review = getReview( state, reviewId, siteId );
	if ( shouldApprove && review ) {
		dispatch( changeReviewStatus( siteId, productId, reviewId, review.status, 'approved' ) );
	}
}

export function announceCreateFailure( { dispatch } ) {
	dispatch( errorNotice( translate( "Your reply couldn't be posted." ), { duration: 5000 } ) );
}

export function handleDeleteReviewReply( { dispatch }, action ) {
	const { siteId, replyId } = action;
	dispatch( request( siteId, action, '/wp/v2' ).del( `comments/${ replyId }?force=true` ) );
}

export function announceDeleteSuccess( { dispatch, getState }, action ) {
	const { siteId, reviewId, replyId } = action;

	dispatch( {
		type: WOOCOMMERCE_REVIEW_REPLY_DELETED,
		siteId,
		reviewId,
		replyId,
	} );

	dispatch( successNotice( translate( 'Reply deleted.' ), { duration: 5000 } ) );
}

export function announceDeleteFailure( { dispatch } ) {
	dispatch( errorNotice( translate( "We couldn't delete this reply." ), { duration: 5000 } ) );
}

export function handleReviewReplyUpdate( { dispatch }, action ) {
	const { siteId, replyId, changes } = action;
	dispatch( request( siteId, action, '/wp/v2' ).post( `comments/${ replyId }`, changes ) );
}

export function handleReviewReplyUpdateSuccess( { dispatch }, action, { data } ) {
	const { siteId, reviewId, replyId } = action;

	dispatch( {
		type: WOOCOMMERCE_REVIEW_REPLY_UPDATED,
		siteId,
		reviewId,
		replyId,
		reply: data,
	} );

	dispatch( clearReviewReplyEdits( siteId ) );
	dispatch(
		successNotice( translate( 'Reply updated.' ), {
			duration: 5000,
		} )
	);
}

export function announceReviewReplyUpdateFailure( { dispatch } ) {
	dispatch(
		successNotice( translate( "We couldn't update this reply." ), {
			duration: 5000,
		} )
	);
}
