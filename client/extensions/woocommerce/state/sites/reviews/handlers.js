/**
 * External dependencies
 */
import qs from 'querystring';
import { omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_QUERY } from './utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_REVIEWS_RECEIVE,
	WOOCOMMERCE_REVIEWS_REQUEST,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_REVIEWS_REQUEST ]: [ dispatchRequest(
		handleReviewsRequest,
		handleReviewsRequestSuccess,
		handleReviewsRequestError
	) ],
};

export function handleReviewsRequest( { dispatch }, action ) {
	const { siteId, query } = action;
	const requestQuery = { ...DEFAULT_QUERY, ...query };
	const queryString = qs.stringify( omitBy( requestQuery, val => '' === val ) );

	dispatch( request( siteId, action ).get( `products/reviews?${ queryString }&_envelope` ) );
}

export function handleReviewsRequestSuccess( store, action, { data } ) {
	const { siteId, query } = action;
	const { headers, body, status } = data;

	// handleReviewsRequest uses &_envelope https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_envelope
	// so that we can get the X-WP-TotalPages and X-WP-Total headers back from the end-site. This means we will always get a 200
	// status back, and the real status of the request will be stored in the response. This checks the real status.
	if ( status !== 200 ) {
		return handleReviewsRequestError( store, action, ( body.code || status ) );
	}

	const total = headers[ 'X-WP-Total' ];

	store.dispatch( {
		type: WOOCOMMERCE_REVIEWS_RECEIVE,
		siteId,
		query,
		total,
		reviews: body,
	} );
}

export function handleReviewsRequestError( { dispatch }, action, error ) {
	const { siteId, query } = action;
	dispatch( {
		type: WOOCOMMERCE_REVIEWS_RECEIVE,
		siteId,
		query,
		error,
	} );
}
