/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isQueryLoading,
	isQueryError,
	items,
	queries,
	total,
} from '../reducer';
import reducer from 'woocommerce/state/sites/reducer';
import {
	WOOCOMMERCE_REVIEWS_REQUEST,
	WOOCOMMERCE_REVIEWS_RECEIVE,
} from 'woocommerce/state/action-types';
import reviews from './fixtures/reviews';
import review from './fixtures/review';

describe( 'reducer', () => {
	describe( 'isQueryLoading', () => {
		it( 'should have no change by default', () => {
			const newState = isQueryLoading( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the currently loading page', () => {
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

		it( 'should show that request has loaded on success', () => {
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

		it( 'should show that request has loaded on failure', () => {
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

		it( 'should not update state for another site ID', () => {
			const action = {
				type: WOOCOMMERCE_REVIEWS_RECEIVE,
				siteId: 546,
				query: {
					page: 1,
				},
				total: 2,
				reviews,
			};

			const newState = reducer( {
				546: {
					reviews: {
						isQueryLoading: {
							'{}': true,
						}
					}
				},
				123: {
					reviews: {
						isQueryLoading: {
							'{}': true,
						}
					}
				}
			}, action );
			expect( newState[ 546 ].reviews.isQueryLoading ).to.eql( { '{}': false } );
			expect( newState[ 123 ].reviews.isQueryLoading ).to.eql( { '{}': true } );
		} );
	} );
	describe( 'isQueryError', () => {
		it( 'should have no change by default', () => {
			const newState = isQueryError( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should do nothing on success', () => {
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

		it( 'should show that request has errored on failure', () => {
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
		it( 'should have no change by default', () => {
			const newState = items( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the reviews in state', () => {
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

		it( 'should add new reviews onto the existing review list', () => {
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
		it( 'should do nothing on a failure', () => {
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
	} );

	describe( 'queries', () => {
		it( 'should have no change by default', () => {
			const newState = queries( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the review IDs for the requested query', () => {
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

		it( 'should add the next page of reviews as a second list', () => {
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

		it( 'should do nothing on a failure', () => {
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
		it( 'should have no change by default', () => {
			const newState = total( undefined, {} );
			expect( newState ).to.eql( 0 );
		} );

		it( 'should store the total number of reviews when a request loads', () => {
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

		it( 'should store the total number of reviews on a subsequent request load', () => {
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

		it( 'should do nothing on a failure', () => {
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
