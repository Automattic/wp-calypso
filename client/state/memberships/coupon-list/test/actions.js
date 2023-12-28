import {
	MEMBERSHIPS_COUPONS_LIST,
	MEMBERSHIPS_COUPON_ADD,
	MEMBERSHIPS_COUPON_DELETE,
	MEMBERSHIPS_COUPON_RECIEVE,
} from 'calypso/state/action-types';
import {
	requestCoupons,
	receiveUpdateCoupon,
	receiveDeleteCoupon,
	requestAddCoupon,
} from '../actions';

describe( 'actions', () => {
	describe( 'requestCoupons()', () => {
		test( 'should return an action object', () => {
			expect( requestCoupons( 123 ) ).toEqual( {
				siteId: 123,
				type: MEMBERSHIPS_COUPONS_LIST,
			} );
		} );
	} );

	describe( 'receiveUpdateCoupon()', () => {
		test( 'should return an action object with the new coupon', () => {
			expect( receiveUpdateCoupon( 123, {} ) ).toEqual( {
				coupon: {},
				siteId: 123,
				type: MEMBERSHIPS_COUPON_RECIEVE,
			} );
		} );
	} );

	describe( 'receiveDeleteCoupon()', () => {
		test( 'should return an action object with the couponId', () => {
			expect( receiveDeleteCoupon( 123, 456 ) ).toEqual( {
				couponId: 456,
				siteId: 123,
				type: MEMBERSHIPS_COUPON_DELETE,
			} );
		} );
	} );

	describe( 'requestAddCoupon', () => {
		test( 'should return an action object with the new coupon', () => {
			requestAddCoupon( 123, {}, 'coupon added' )( ( foo ) => console.log( foo ) );
			expect( requestAddCoupon( 123, {}, 'coupon added' ) ).toEqual( {
				coupon: {},
				siteId: 123,
				type: MEMBERSHIPS_COUPON_ADD,
			} );
			requestAddCoupon(
				123,
				{},
				'coupon added'
			)( ( result ) => {
				expect( result ).toEqual( {
					coupon: {},
					siteId: 123,
					type: MEMBERSHIPS_COUPON_ADD,
				} );
			} );
		} );
	} );
} );
