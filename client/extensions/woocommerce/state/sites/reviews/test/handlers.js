/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	handleReviewsRequest,
	handleReviewsRequestSuccess,
	handleReviewsRequestError,
	handleChangeReviewStatus,
	handleChangeReviewStatusSuccess,
	announceStatusChangeFailure,
	handleDeleteReview,
	announceDeleteSuccess,
	announceDeleteFailure,
} from '../handlers.js';
import reviews from './fixtures/reviews';
import { NOTICE_CREATE, WPCOM_HTTP_REQUEST } from 'calypso/state/action-types';
import {
	WOOCOMMERCE_REVIEWS_RECEIVE,
	WOOCOMMERCE_REVIEWS_REQUEST,
	WOOCOMMERCE_REVIEW_STATUS_CHANGE,
} from 'woocommerce/state/action-types';
import {
	changeReviewStatus,
	deleteReview,
	fetchReviews,
} from 'woocommerce/state/sites/reviews/actions';

describe( 'handlers', () => {
	describe( '#handleReviewsRequest', () => {
		test( 'should dispatch a get action', () => {
			const siteId = '123';
			const action = fetchReviews( siteId );
			const result = handleReviewsRequest( action );
			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path:
						'/wc/v3/products/calypso-reviews&page=1&per_page=10&status=pending&_envelope&_method=GET',
					json: true,
					apiVersion: '1.1',
				},
			} );
		} );
	} );
	describe( '#handleReviewsRequestSuccess()', () => {
		test( 'should dispatch reviews receive with the reviews list', () => {
			const siteId = '123';
			const response = {
				data: {
					body: reviews,
					status: 200,
					headers: {
						'X-WP-TotalPages': 1,
						'X-WP-Total': 2,
					},
				},
			};
			const action = fetchReviews( siteId );
			const result = handleReviewsRequestSuccess( action, response );

			expect( result ).toEqual( {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId,
				query: {},
				total: 2,
				reviews,
			} );
		} );
		test( 'should dispatch with an error if the envelope response is not 200', () => {
			const siteId = '123';
			const response = {
				data: {
					body: {
						message: 'No route was found matching the URL and request method',
						code: 'rest_no_route',
					},
					status: 404,
				},
			};

			const action = fetchReviews( siteId );
			const result = handleReviewsRequestSuccess( action, response );

			expect( result ).toEqual( {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId,
				query: {},
				error: 'rest_no_route',
			} );
		} );
	} );
	describe( '#handleReviewsRequestError()', () => {
		test( 'should dispatch error', () => {
			const siteId = '123';
			const action = fetchReviews( siteId, 1 );
			const result = handleReviewsRequestError( action, 'rest_no_route' );

			expect( result ).toEqual( {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId,
				query: {},
				error: 'rest_no_route',
			} );
		} );
	} );
	describe( '#handleChangeReviewStatus', () => {
		test( 'should dispatch a request', () => {
			const siteId = '123';
			const productId = '544';
			const reviewId = '105';
			const currentStatus = 'pending';
			const newStatus = 'approved';

			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, newStatus );
			const result = handleChangeReviewStatus( action );

			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					json: true,
					apiVersion: '1.1',
				},
				body: {
					path: `/wp/v2/comments/${ reviewId }&_method=POST`,
					body: JSON.stringify( { status: 'approved' } ),
				},
			} );
		} );
	} );
	describe( '#handleChangeReviewStatusSuccess', () => {
		const siteId = '123';
		const productId = '544';
		const reviewId = '105';
		const currentStatus = 'pending';
		const getState = () => {
			return {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								reviews: {
									items: keyBy( reviews, 'id' ),
								},
							},
						},
					},
				},
			};
		};

		test( 'should dispatch a fetch request for trash status updates', () => {
			const dispatch = jest.fn();
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'trash' );
			handleChangeReviewStatusSuccess( action )( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
		} );

		test( 'should dispatch a fetch request for spam status updates', () => {
			const dispatch = jest.fn();
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'spam' );
			handleChangeReviewStatusSuccess( action )( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
		} );

		test( 'should not dispatch a fetch request for other status updates', () => {
			const dispatch = jest.fn();
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'approved' );
			handleChangeReviewStatusSuccess( action )( dispatch, getState );
			expect( dispatch ).not.toHaveBeenCalledWith(
				expect.objectContaining( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
		} );
	} );

	describe( '#announceStatusChangeFailure', () => {
		test( 'should reset the status and dispatch an error', () => {
			const siteId = '123';
			const productId = '544';
			const reviewId = '105';
			const currentStatus = 'pending';
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'approved' );
			const result = announceStatusChangeFailure( action );

			expect( result[ 0 ] ).toMatchObject( {
				type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
				newStatus: 'pending', // Status should change back to 'pending'
			} );

			expect( result[ 1 ] ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );

	describe( '#handleDeleteReview', () => {
		const siteId = '123';
		const productId = '544';
		const reviewId = '105';

		test( 'should dispatch a request', () => {
			const action = deleteReview( siteId, productId, reviewId );
			const result = handleDeleteReview( action );
			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					json: true,
					apiVersion: '1.1',
				},
				body: {
					path: `/wp/v2/comments/${ reviewId }&force=true&_method=DELETE`,
				},
			} );
		} );
	} );

	describe( '#announceDeleteSuccess', () => {
		const siteId = '123';
		const getState = () => {
			return {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								reviews: {
									items: keyBy( reviews, 'id' ),
								},
							},
						},
					},
				},
			};
		};

		test( 'should dispatch a fetch request and success notice', () => {
			const dispatch = jest.fn();
			const action = deleteReview( siteId, 544, 105 );
			announceDeleteSuccess( action )( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: NOTICE_CREATE,
				} )
			);
		} );
	} );

	describe( '#announceDeleteFailure', () => {
		test( 'should dispatch an error', () => {
			const siteId = '123';
			const action = deleteReview( siteId, 544, 105 );
			const result = announceDeleteFailure( action );
			expect( result ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );
} );
