import { getCouponsForSiteId } from '../selectors';

describe( 'selectors', () => {
	describe( 'getCouponsForSiteId()', () => {
		test( 'should return an array of coupons', () => {
			const existingCoupons = [ { ID: 1 }, { ID: 2 } ];
			const existingState = { memberships: { couponList: { items: { 1: existingCoupons } } } };
			const siteId = '1';

			expect( getCouponsForSiteId( existingState, siteId ) ).toEqual( existingCoupons );
		} );
	} );
} );
