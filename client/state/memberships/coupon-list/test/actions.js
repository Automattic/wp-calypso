import {
	MEMBERSHIPS_COUPONS_LIST,
	MEMBERSHIPS_COUPON_RECEIVE,
	MEMBERSHIPS_COUPON_DELETE,
} from 'calypso/state/action-types';
import { requestCoupons, receiveUpdateCoupon, receiveDeleteCoupon } from '../actions';

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
				type: MEMBERSHIPS_COUPON_RECEIVE,
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
} );
