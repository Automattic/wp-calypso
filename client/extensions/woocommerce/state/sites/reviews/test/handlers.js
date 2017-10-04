/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { keyBy } from 'lodash';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	changeReviewStatus,
	deleteReview,
	fetchReviews,
} from 'woocommerce/state/sites/reviews/actions';
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
import { NOTICE_CREATE } from 'state/action-types';
import reviews from './fixtures/reviews';
import {
	WOOCOMMERCE_REVIEWS_RECEIVE,
	WOOCOMMERCE_REVIEWS_REQUEST,
	WOOCOMMERCE_REVIEW_STATUS_CHANGE,
} from 'woocommerce/state/action-types';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

describe( 'handlers', () => {
	describe( '#handleReviewsRequest', () => {
		it( 'should dispatch a get action', () => {
			const siteId = '123';
			const dispatch = spy();
			const action = fetchReviews( siteId );
			handleReviewsRequest( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WPCOM_HTTP_REQUEST,
					method: 'GET',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					query: {
						path: '/wc/v3/products/reviews&page=1&per_page=10&status=pending&_envelope&_method=GET',
						json: true,
						apiVersion: '1.1',
					},
				} )
			);
		} );
	} );
	describe( '#handleReviewsRequestSuccess()', () => {
		it( 'should dispatch reviews receive with the reviews list', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
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
	describe( '#handleChangeReviewStatus', () => {
		it( 'should dispatch a request', () => {
			const siteId = '123';
			const productId = '544';
			const reviewId = '105';
			const currentStatus = 'pending';
			const newStatus = 'approved';
			const dispatch = spy();
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, newStatus );
			handleChangeReviewStatus( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				match( {
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
				} )
			);
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

		it( 'should dispatch a fetch request for trash status updates', () => {
			const store = {
				dispatch: spy(),
				getState,
			};
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'trash' );
			handleChangeReviewStatusSuccess( store, action );
			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
		} );

		it( 'should dispatch a fetch request for spam status updates', () => {
			const store = {
				dispatch: spy(),
				getState,
			};
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'spam' );
			handleChangeReviewStatusSuccess( store, action );
			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
		} );

		it( 'should not dispatch a fetch request for other status updates', () => {
			const store = {
				dispatch: spy(),
				getState,
			};
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'approved' );
			handleChangeReviewStatusSuccess( store, action );
			expect( store.dispatch ).to.not.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
		} );
	} );

	describe( '#announceStatusChangeFailure', () => {
		const siteId = '123';
		const productId = '544';
		const reviewId = '105';
		const currentStatus = 'pending';
		const dispatch = spy();

		it( 'should reset the status and dispatch an error', () => {
			const action = changeReviewStatus( siteId, productId, reviewId, currentStatus, 'approved' );
			announceStatusChangeFailure( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
					newStatus: 'pending', // Status should change back to 'pending'
				} )
			);

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: NOTICE_CREATE,
				} )
			);
		} );
	} );

	describe( '#handleDeleteReview', () => {
		const siteId = '123';
		const productId = '544';
		const reviewId = '105';
		it( 'should dispatch a request', () => {
			const dispatch = spy();
			const action = deleteReview( siteId, productId, reviewId );
			handleDeleteReview( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				match( {
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
				} )
			);
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

		it( 'should dispatch a fetch request and success notice', () => {
			const store = {
				dispatch: spy(),
				getState,
			};
			const action = deleteReview( siteId, 544, 105 );
			announceDeleteSuccess( store, action );
			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_REVIEWS_REQUEST,
				} )
			);
			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: NOTICE_CREATE,
				} )
			);
		} );
	} );
	describe( '#announceDeleteFailure', () => {
		const siteId = '123';
		const dispatch = spy();
		it( 'should dispatch an error', () => {
			const action = deleteReview( siteId, 544, 105 );
			announceDeleteFailure( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: NOTICE_CREATE,
				} )
			);
		} );
	} );
} );
