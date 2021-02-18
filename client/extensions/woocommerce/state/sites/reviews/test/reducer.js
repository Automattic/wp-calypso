/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { isQueryLoading, isQueryError, items, queries, total } from '../reducer';
import review from './fixtures/review';
import reviews from './fixtures/reviews';
import {
	WOOCOMMERCE_REVIEWS_REQUEST,
	WOOCOMMERCE_REVIEWS_RECEIVE,
	WOOCOMMERCE_REVIEW_STATUS_CHANGE,
} from 'woocommerce/state/action-types';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	describe( 'isQueryLoading', () => {
		test( 'should have no change by default', () => {
			const newState = isQueryLoading( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the currently loading page', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_REQUEST,
				siteId: 123,
				query: {
					page: 1,
				},
			};
			const newState = isQueryLoading( undefined, action );
			expect( newState ).to.eql( { '{}': true } );
		} );

		test( 'should show that request has loaded on success', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 2,
				reviews,
			};
			const newState = isQueryLoading( { '{}': true }, action );
			expect( newState ).to.eql( { '{}': false } );
		} );

		test( 'should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const newState = isQueryLoading( { '{}': true }, action );
			expect( newState ).to.eql( { '{}': false } );
		} );

		test( 'should not update state for another site ID', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 546,
				query: {
					page: 1,
				},
				total: 2,
				reviews,
			};

			const newState = reducer(
				{
					546: {
						reviews: {
							isQueryLoading: {
								'{}': true,
							},
						},
					},
					123: {
						reviews: {
							isQueryLoading: {
								'{}': true,
							},
						},
					},
				},
				action
			);
			expect( newState[ 546 ].reviews.isQueryLoading ).to.eql( { '{}': false } );
			expect( newState[ 123 ].reviews.isQueryLoading ).to.eql( { '{}': true } );
		} );
	} );
	describe( 'isQueryError', () => {
		test( 'should have no change by default', () => {
			const newState = isQueryError( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should do nothing on success', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 2,
				reviews,
			};
			const newState = isQueryError( undefined, action );
			expect( newState ).to.eql( {} );
		} );

		test( 'should show that request has errored on failure', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const newState = isQueryError( undefined, action );
			expect( newState ).to.eql( { '{}': true } );
		} );
	} );
	describe( 'items', () => {
		test( 'should have no change by default', () => {
			const newState = items( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the reviews in state', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 3,
				reviews,
			};
			const newState = items( undefined, action );
			const reviewsById = keyBy( reviews, 'id' );
			expect( newState ).to.eql( reviewsById );
		} );

		test( 'should add new reviews onto the existing review list', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 3,
				reviews: [ review ],
			};
			const originalState = deepFreeze( keyBy( reviews, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 222: review } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const originalState = deepFreeze( keyBy( reviews, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( originalState );
		} );

		test( 'should update the status of an item when a change status action occurs', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
				siteId: 123,
				productId: 544,
				reviewId: 105,
				currentStatus: 'pending',
				newStatus: 'approved',
			};
			const originalState = deepFreeze( keyBy( reviews, 'id' ) );
			const newState = items( originalState, action );
			expect( originalState[ 105 ].status ).to.eql( 'pending' );
			expect( newState[ 105 ].status ).to.eql( 'approved' );
		} );
	} );

	describe( 'queries', () => {
		test( 'should have no change by default', () => {
			const newState = queries( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the review IDs for the requested query', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 3,
				reviews,
			};
			const newState = queries( undefined, action );
			expect( newState ).to.eql( { '{}': [ 100, 105 ] } );
		} );

		test( 'should add the next page of reviews as a second list', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 3,
				reviews: [ review ],
			};
			const originalState = deepFreeze( { '{}': [ 100, 105 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( { ...originalState, '{"page":2}': [ 222 ] } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const originalState = deepFreeze( { '{}': [ 100, 105 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
	describe( 'total', () => {
		test( 'should have no change by default', () => {
			const newState = total( undefined, {} );
			expect( newState ).to.eql( 0 );
		} );

		test( 'should store the total number of reviews when a request loads', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 3,
				reviews,
			};
			const newState = total( undefined, action );
			expect( newState ).to.eql( { '{}': 3 } );
		} );

		test( 'should store the total number of reviews on a subsequent request load', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 3,
				reviews: [ review ],
			};
			const originalState = deepFreeze( { '{}': 3 } );
			const newState = total( originalState, action );
			expect( newState ).to.eql( { '{}': 3 } );
		} );

		test( 'should update the number of reviews for a status query when a status changes', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
				siteId: 123,
				productId: 5,
				reviewId: 6,
				currentStatus: 'pending',
				newStatus: 'approved',
			};
			const originalState = deepFreeze( { '{}': 3, '{"status":"approved"}': 1 } );
			const newState = total( originalState, action );
			expect( newState ).to.eql( { '{}': 2, '{"status":"approved"}': 2 } );
		} );

		test( 'should not update the number of reviews for a status query when a previous total is absent', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
				siteId: 123,
				productId: 5,
				reviewId: 6,
				currentStatus: 'approved',
				newStatus: 'trash',
			};
			const originalState = deepFreeze( { '{"status":"approved"}': 1 } );
			const newState = total( originalState, action );
			expect( newState ).to.eql( { '{"status":"approved"}': 0 } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const originalState = deepFreeze( { '{}': 3 } );
			const newState = total( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
} );
