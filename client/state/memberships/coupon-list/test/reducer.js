import deepFreeze from 'deep-freeze';
import {
	MEMBERSHIPS_COUPONS_RECEIVE,
	MEMBERSHIPS_COUPON_RECEIVE,
	MEMBERSHIPS_COUPON_DELETE,
} from '../../../action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			expect( items( undefined, {} ) ).toEqual( {} );
		} );
	} );

	describe( 'MEMBERSHIPS_COUPONS_RECEIVE', () => {
		test( 'should properly add coupons for site', () => {
			const coupons = [ { ID: 1 }, { ID: 2 } ];
			const siteId = 1;
			const expectation = { 1: coupons };

			expect( items( {}, { type: MEMBERSHIPS_COUPONS_RECEIVE, siteId, coupons } ) ).toEqual(
				expectation
			);
		} );
	} );

	describe( 'MEMBERSHIPS_COUPON_RECEIVE', () => {
		test( 'should properly add coupons for site', () => {
			const existingCoupons = [ { ID: 1 }, { ID: 2 } ];
			const existingState = deepFreeze( { 1: existingCoupons } );
			const newCoupon = { ID: 3 };
			const siteId = '1';
			const expectation = { 1: [ newCoupon, ...existingCoupons ] };
			expect(
				items( existingState, { type: MEMBERSHIPS_COUPON_RECEIVE, siteId, coupon: newCoupon } )
			).toEqual( expectation );
		} );
	} );

	describe( 'MEMBERSHIPS_COUPON_DELETE', () => {
		test( 'should properly delete coupons for specified site', () => {
			const existingCoupons = [ { ID: 1 }, { ID: 2 }, { ID: 3 } ];
			const existingState = { 1: existingCoupons };
			const couponToDelete = { ID: 3 };
			const siteId = '1';
			const expectation = {
				1: existingCoupons.filter( ( coupon ) => coupon.ID !== couponToDelete.ID ),
			};
			expect(
				items( existingState, { type: MEMBERSHIPS_COUPON_DELETE, siteId, coupon: couponToDelete } )
			).toEqual( expectation );
		} );
	} );
} );
