/** @format */

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
} from './fixtures/promotions';
import {
	fetchPromotions,
	createPromotion,
	updatePromotion,
	deletePromotion,
} from '../actions';
import {
	promotionsRequest,
	productsRequestSuccess,
	couponsUpdated,
	promotionCreate,
	promotionUpdate,
	promotionDelete,
} from '../handlers';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_COUPONS_REQUEST,
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	const siteId = 123;

	const successAction = { type: '%%SUCCESS%%' };
	const failureAction = { type: '%%FAILURE%%' };

	describe( '#promotionsRequest', () => {
		test( 'should dispatch the first requests for products and coupons', () => {
			const store = {
				dispatch: spy(),
			};

			const action = fetchPromotions( siteId, 3 );
			promotionsRequest( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_COUPONS_REQUEST,
					siteId: 123,
					params: { offset: 0, per_page: 3 },
				} )
			);

			// TODO: Test as above after products use data-layer
			expect( store.dispatch.secondCall.returnValue ).to.be.a.function;
		} );
	} );

	describe( '#couponsUpdated', () => {
		test( 'should dispatch a request for the next page', () => {
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

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_COUPONS_REQUEST,
					siteId: 123,
					params: { offset: 5, per_page: 5 },
				} )
			);
		} );

		test( 'should not dispatch after the last page', () => {
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
		test( 'should dispatch a request for the next page', () => {
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

		test( 'should not dispatch after the last page', () => {
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

	describe( '#promotionCreate', () => {
		it( 'should dispatch a create coupon action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'coupon:12',
				type: 'coupon',
				coupon: {
					code: '10off',
					discount_type: 'percent',
					amount: '10'
				}
			};
			const action = createPromotion( siteId, promotion, successAction, failureAction );

			promotionCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: 'WOOCOMMERCE_COUPON_CREATE',
				coupon: promotion.coupon,
			} ) );
		} );

		it( 'should dispatch an update product action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'product:12',
				type: 'product_sale',
				product: {
					id: 12,
					sale_price: '9.99',
				}
			};
			const action = createPromotion( siteId, promotion, successAction, failureAction );

			promotionCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: 'WOOCOMMERCE_PRODUCT_UPDATE',
				product: promotion.product,
			} ) );
		} );
	} );

	describe( '#promotionUpdate', () => {
		it( 'should dispatch an update coupon action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 14,
				type: 'coupon',
				coupon: {
					code: '10off',
					discount_type: 'percent',
					amount: '10'
				}
			};
			const action = updatePromotion( siteId, promotion, successAction, failureAction );

			promotionUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: 'WOOCOMMERCE_COUPON_UPDATE',
				coupon: promotion.coupon,
			} ) );
		} );

		it( 'should dispatch an update product action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'product:12',
				type: 'product_sale',
				product: {
					id: 12,
					sale_price: '9.99',
				}
			};
			const action = updatePromotion( siteId, promotion, successAction, failureAction );

			promotionUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: 'WOOCOMMERCE_PRODUCT_UPDATE',
				product: promotion.product,
			} ) );
		} );
	} );

	describe( '#promotionDelete', () => {
		it( 'should dispatch a delete coupon action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 14,
				type: 'coupon',
				coupon: {
					code: '10off',
					discount_type: 'percent',
					amount: '10'
				}
			};
			const action = deletePromotion( siteId, promotion, successAction, failureAction );

			promotionDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: 'WOOCOMMERCE_COUPON_DELETE',
				couponId: promotion.coupon.id,
			} ) );
		} );

		it( 'should dispatch an update product action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'product:12',
				type: 'product_sale',
				product: {
					id: 12,
					sale_price: '10',
				}
			};
			const action = deletePromotion( siteId, promotion, successAction, failureAction );

			promotionDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: 'WOOCOMMERCE_PRODUCT_UPDATE',
				product: match( { id: 12, sale_price: undefined } ),
			} ) );
		} );
	} );
} );
