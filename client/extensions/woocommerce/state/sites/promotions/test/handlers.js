/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	coupons1,
	coupons2,
	products1,
	products2,
} from './fixtures';
import { fetchPromotions } from '../actions';
import {
	promotionsRequest,
	productsRequestSuccess,
	couponsUpdated,
} from '../handlers';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_COUPONS_REQUEST,
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	const siteId = 123;

	describe( '#promotionsRequest', () => {
		it( 'should dispatch the first requests for products and coupons', () => {
			const store = {
				dispatch: spy(),
			};

			const action = fetchPromotions( siteId, 3 );
			promotionsRequest( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_COUPONS_REQUEST,
				siteId: 123,
				params: { offset: 0, per_page: 3 },
			} ) );

			// TODO: Test as above after products use data-layer
			expect( store.dispatch.secondCall.returnValue ).to.be.a.function;
		} );
	} );

	describe( '#couponsUpdated', () => {
		it( 'should dispatch a request for the next page', () => {
			const store = {
				dispatch: spy(),
			};

			const action = {
				type: WOOCOMMERCE_COUPONS_UPDATED,
				siteId,
				coupons: coupons1,
				params: { offset: 0, per_page: 5 },
				totalCoupons: 7,
			};
			couponsUpdated( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_COUPONS_REQUEST,
				siteId: 123,
				params: { offset: 5, per_page: 5 },
			} ) );
		} );

		it( 'should not dispatch after the last page', () => {
			const store = {
				dispatch: spy(),
			};

			const action = {
				type: WOOCOMMERCE_COUPONS_UPDATED,
				siteId,
				coupons: coupons2,
				params: { offset: 5, per_page: 5 },
				totalCoupons: 7,
			};
			couponsUpdated( store, action );

			expect( store.dispatch ).to.not.have.been.called;
		} );
	} );

	describe( '#productsRequestSuccess', () => {
		it( 'should dispatch a request for the next page', () => {
			const store = {
				dispatch: spy(),
			};

			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId,
				products: products1,
				params: { offset: 0, per_page: 3 },
				totalProducts: 4,
			};

			productsRequestSuccess( store, action );

			// TODO: test as above for coupons after products gets refactored to data-layer.
			expect( store.dispatch.firstCall.returnValue ).to.be.a.function;
		} );

		it( 'should not dispatch after the last page', () => {
			const store = {
				dispatch: spy(),
			};

			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId,
				products: products2,
				params: { offset: 3, per_page: 3 },
				totalProducts: 4,
			};

			productsRequestSuccess( store, action );

			expect( store.dispatch ).to.not.have.been.called;
		} );
	} );
} );

