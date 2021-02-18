/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { coupons1, coupons2 } from './fixtures/promotions';
import { fetchPromotions, createPromotion, updatePromotion, deletePromotion } from '../actions';
import {
	promotionsRequest,
	couponsUpdated,
	promotionCreate,
	promotionUpdate,
	promotionDelete,
} from '../handlers';
import {
	WOOCOMMERCE_COUPONS_REQUEST,
	WOOCOMMERCE_COUPONS_UPDATED,
	WOOCOMMERCE_PRODUCTS_REQUEST,
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

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST,
					siteId: 123,
					params: { offset: 0, per_page: 3 },
				} )
			);
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

	describe( '#promotionCreate', () => {
		it( 'should dispatch a create coupon action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'coupon:12',
				type: 'percent',
				appliesTo: { productIds: [ 1, 2 ] },
				couponCode: '10off',
				percentDiscount: '10',
				endDate: '2017-12-15T12:15:02',
			};

			const expectedCouponData = {
				code: '10off',
				discount_type: 'percent',
				amount: '10',
				product_ids: [ 1, 2 ],
				date_expires: '2017-12-15T12:15:02',
			};

			const action = createPromotion( siteId, promotion, successAction, failureAction );

			promotionCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: 'WOOCOMMERCE_COUPON_CREATE',
					coupon: expectedCouponData,
				} )
			);
		} );

		it( 'should dispatch an update product action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'product:12',
				type: 'product_sale',
				appliesTo: { productIds: [ 12 ] },
				salePrice: '9.99',
				startDate: '2017-10-15T12:15:02',
				endDate: '2017-11-15T12:15:02',
			};

			const expectedProductData = {
				id: 12,
				sale_price: '9.99',
				date_on_sale_from: '2017-10-15T12:15:02',
				date_on_sale_to: '2017-11-15T12:15:02',
			};

			const action = createPromotion( siteId, promotion, successAction, failureAction );

			promotionCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: 'WOOCOMMERCE_PRODUCT_UPDATE',
					product: expectedProductData,
				} )
			);
		} );
	} );

	describe( '#promotionUpdate', () => {
		it( 'should dispatch an update coupon action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'coupon:23',
				type: 'percent',
				couponCode: '10off',
				percentDiscount: '10',
				appliesTo: { all: true },
				usageLimit: '25',
				individualUse: true,
				couponId: 27,
			};

			const expectedCouponData = {
				id: 27,
				code: '10off',
				discount_type: 'percent',
				amount: '10',
				individual_use: true,
				usage_limit: '25',
			};

			const action = updatePromotion( siteId, promotion, successAction, failureAction );

			promotionUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: 'WOOCOMMERCE_COUPON_UPDATE',
					coupon: expectedCouponData,
				} )
			);
		} );

		it( 'should dispatch an update product action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'product:12',
				type: 'product_sale',
				salePrice: '9.99',
				appliesTo: { productIds: [ 12 ] },
			};

			const expectedProductData = {
				id: 12,
				sale_price: '9.99',
			};

			const action = updatePromotion( siteId, promotion, successAction, failureAction );

			promotionUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: 'WOOCOMMERCE_PRODUCT_UPDATE',
					product: expectedProductData,
				} )
			);
		} );
	} );

	describe( '#promotionDelete', () => {
		it( 'should dispatch a delete coupon action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 14,
				type: 'percent',
				couponCode: '10off',
				percentDiscount: '10',
				appliesTo: { all: true },
				couponId: 25,
			};

			const action = deletePromotion( siteId, promotion, successAction, failureAction );

			promotionDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: 'WOOCOMMERCE_COUPON_DELETE',
					couponId: 25,
				} )
			);
		} );

		it( 'should dispatch an update product action', () => {
			const store = {
				dispatch: spy(),
			};

			const promotion = {
				id: 'product:12',
				type: 'product_sale',
				appliesTo: { productIds: [ 12 ] },
				salePrice: '10',
				endDate: '2017-12-01T05:25:00',
				productId: 12,
			};

			const expectedProductData = {
				id: 12,
				date_on_sale_from: null,
				date_on_sale_to: null,
				sale_price: '',
			};

			const action = deletePromotion( siteId, promotion, successAction, failureAction );

			promotionDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: 'WOOCOMMERCE_PRODUCT_UPDATE',
					product: match( expectedProductData ),
				} )
			);
		} );
	} );
} );
