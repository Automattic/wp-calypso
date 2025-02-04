import { getCouponsForSiteId } from '../selectors';

describe( 'selectors', () => {
	describe( 'getCouponsForSiteId()', () => {
		test( 'should return an array of coupons when coupons exist for that site', () => {
			const existingCoupons = [ { ID: 1 }, { ID: 2 } ];
			const existingState = { memberships: { couponList: { items: { 1: existingCoupons } } } };
			const siteId = '1';

			expect( getCouponsForSiteId( existingState, siteId ) ).toEqual( existingCoupons );
		} );

		test( 'should return an empty array of coupons when no coupons exist for that site', () => {
			const existingState = {
				memberships: { couponList: { items: { 1: [], 2: [ { ID: 1 }, { ID: 2 } ] } } },
			};
			const siteId = '1';

			expect( getCouponsForSiteId( existingState, siteId ) ).toEqual( [] );
		} );

		test( 'should return an empty array of coupons when site does not exist', () => {
			const existingState = {
				memberships: { couponList: { items: { 1: [], 2: [ { ID: 1 }, { ID: 2 } ] } } },
			};
			const siteId = '3';

			expect( getCouponsForSiteId( existingState, siteId ) ).toEqual( [] );
		} );
	} );
} );
