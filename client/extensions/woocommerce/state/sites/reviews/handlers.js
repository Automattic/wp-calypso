/**
 * External dependencies
 */

import { get, omitBy, omit } from 'lodash';
import { stringify } from 'qs';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { bypassDataLayer } from 'state/data-layer/utils';
import { DEFAULT_QUERY } from './utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { fetchCounts } from 'woocommerce/state/sites/data/counts/actions';
import { fetchReviews } from 'woocommerce/state/sites/reviews/actions';
import {
	getReviewsCurrentPage,
	getReviewsCurrentSearch,
} from 'woocommerce/state/ui/reviews/selectors';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_REVIEWS_RECEIVE,
	WOOCOMMERCE_REVIEWS_REQUEST,
	WOOCOMMERCE_REVIEW_DELETE,
	WOOCOMMERCE_REVIEW_STATUS_CHANGE,
} from 'woocommerce/state/action-types';

export function handleReviewsRequest( action ) {
	const { siteId, query } = action;
	const requestQuery = { ...DEFAULT_QUERY, ...query };
	const queryString = stringify( omitBy( requestQuery, ( val ) => '' === val ) );

	return request( siteId, action ).get( `products/calypso-reviews?${ queryString }&_envelope` );
}

export function handleReviewsRequestSuccess( action, { data } ) {
	const { siteId, query } = action;
	const { headers, body, status } = data;

	// handleReviewsRequest uses &_envelope https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_envelope
	// so that we can get the X-WP-TotalPages and X-WP-Total headers back from the end-site. This means we will always get a 200
	// status back, and the real status of the request will be stored in the response. This checks the real status.
	if ( status !== 200 ) {
		return handleReviewsRequestError( action, body.code || status );
	}

	const total = headers[ 'X-WP-Total' ];

	return {
		type: WOOCOMMERCE_REVIEWS_RECEIVE,
		siteId,
		query,
		total,
		reviews: body,
	};
}

export function handleReviewsRequestError( action, error ) {
	const { siteId, query } = action;
	return {
		type: WOOCOMMERCE_REVIEWS_RECEIVE,
		siteId,
		query,
		error,
	};
}

export function handleChangeReviewStatus( action ) {
	const { siteId, reviewId, newStatus } = action;
	// @todo Update this to use reviews update endpoint when it supports status updating.
	// https://github.com/woocommerce/wc-api-dev/issues/51
	// We can use the WP-API comments endpoint for now with no issue. The only difference is pending vs hold.
	const statusToPass = 'pending' === newStatus ? 'hold' : newStatus;
	return request( siteId, action, '/wp/v2' ).post( `comments/${ reviewId }`, {
		status: statusToPass,
	} );
}

export function handleChangeReviewStatusSuccess( action ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const { siteId, currentStatus, newStatus } = action;

		// Refreshes the review list if dealing with trash and spam.
		// otherwise pending/approved reviews stay in their current lists.
		// This matches the behavior of comments management.
		if (
			'spam' === currentStatus ||
			'spam' === newStatus ||
			'trash' === currentStatus ||
			'trash' === newStatus
		) {
			const currentPage = getReviewsCurrentPage( state, siteId );
			const currentSearch = getReviewsCurrentSearch( state, siteId );
			const query = {
				page: currentPage,
				search: currentSearch,
				status: currentStatus,
			};

			if ( '' !== currentSearch ) {
				query.status = 'any';
			}

			dispatch( fetchReviews( siteId, query ) );
		}

		const message = {
			approved: translate( 'Review approved.' ),
			pending: translate( 'Review unapproved.' ),
			spam: translate( 'Review marked as spam.' ),
			trash: translate( 'Review trashed.' ),
		};
		const defaultMessage = translate( 'Review status updated' );

		dispatch( fetchCounts( siteId ) );
		dispatch(
			successNotice( get( message, newStatus, defaultMessage ), {
				duration: 5000,
			} )
		);
	};
}

export function announceStatusChangeFailure( action ) {
	const { reviewId, currentStatus } = action;

	// Reverts the local status back to what it was if the remote request failed.
	const actions = [
		bypassDataLayer( {
			...omit( action, [ 'meta' ] ),
			newStatus: currentStatus,
		} ),
	];

	const errorMessage = {
		approved: translate( "We couldn't approve this review." ),
		pending: translate( "We couldn't unapprove this review." ),
		spam: translate( "We couldn't mark this review as spam." ),
		trash: translate( "We couldn't move this review to trash." ),
	};
	const defaultErrorMessage = translate( "We couldn't update this review." );

	actions.push(
		errorNotice( get( errorMessage, currentStatus, defaultErrorMessage ), {
			id: `review-notice-error-${ reviewId }`,
		} )
	);
	return actions;
}

export function handleDeleteReview( action ) {
	const { siteId, reviewId } = action;
	return request( siteId, action, '/wp/v2' ).del( `comments/${ reviewId }?force=true` );
}

export function announceDeleteSuccess( action ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const { siteId } = action;
		const currentPage = getReviewsCurrentPage( state, siteId );

		dispatch( fetchReviews( siteId, { search: '', page: currentPage, status: 'trash' } ) );
		dispatch( successNotice( translate( 'Review deleted permanently.' ), { duration: 5000 } ) );
	};
}

export function announceDeleteFailure() {
	return errorNotice( translate( "We couldn't delete this review." ), { duration: 5000 } );
}

export default {
	[ WOOCOMMERCE_REVIEWS_REQUEST ]: [
		dispatchRequest( {
			fetch: handleReviewsRequest,
			onSuccess: handleReviewsRequestSuccess,
			onError: handleReviewsRequestError,
		} ),
	],
	[ WOOCOMMERCE_REVIEW_STATUS_CHANGE ]: [
		dispatchRequest( {
			fetch: handleChangeReviewStatus,
			onSuccess: handleChangeReviewStatusSuccess,
			onError: announceStatusChangeFailure,
		} ),
	],
	[ WOOCOMMERCE_REVIEW_DELETE ]: [
		dispatchRequest( {
			fetch: handleDeleteReview,
			onSuccess: announceDeleteSuccess,
			onError: announceDeleteFailure,
		} ),
	],
};
