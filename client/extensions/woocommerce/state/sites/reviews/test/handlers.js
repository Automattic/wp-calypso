/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	fetchReviews,
} from 'woocommerce/state/sites/reviews/actions';
import {
	handleReviewsRequest,
	handleReviewsRequestSuccess,
	handleReviewsRequestError,
} from '../handlers.js';
import reviews from './fixtures/reviews';
import {
	WOOCOMMERCE_REVIEWS_RECEIVE,
} from 'woocommerce/state/action-types';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

describe( 'handlers', () => {
	describe( '#handleReviewsRequest', () => {
		it( 'should dispatch a get action', () => {
			const siteId = '123';
			const dispatch = spy();
			const action = fetchReviews( siteId );
			handleReviewsRequest( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: '/wc/v3/products/reviews&page=1&per_page=10&status=pending&_envelope&_method=GET',
					json: true,
					apiVersion: '1.1',
				}
			} ) );
		} );
	} );
	describe( '#handleReviewsRequestSuccess()', () => {
		it( 'should dispatch reviews receive with the reviews list', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = { data: {
				body: reviews,
				status: 200,
				headers: {
					'X-WP-TotalPages': 1,
					'X-WP-Total': 2,
				}
			} };

			const action = fetchReviews( siteId );
			handleReviewsRequestSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId,
				query: {},
				total: 2,
				reviews,
			} );
		} );
		it( 'should dispatch with an error if the envelope response is not 200', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = { data: {
				body: {
					message: 'No route was found matching the URL and request method',
					code: 'rest_no_route',
				},
				status: 404,
			} };

			const action = fetchReviews( siteId );
			handleReviewsRequestSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId,
				query: {},
				error: 'rest_no_route',
			} );
		} );
	} );
	describe( '#handleReviewsRequestError()', () => {
		it( 'should dispatch error', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};

			const action = fetchReviews( siteId, 1 );
			handleReviewsRequestError( store, action, 'rest_no_route' );

			expect( store.dispatch ).to.have.been.calledWithMatch( {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId,
				query: {},
				error: 'rest_no_route',
			} );
		} );
	} );
} );
