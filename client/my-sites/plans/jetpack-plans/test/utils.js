/**
 * Mocks
 */
jest.mock( 'calypso/state/products-list/selectors/get-product-cost' );
jest.mock( 'calypso/state/currency-code/selectors' );

import { getYearlySlugFromMonthly } from 'calypso/my-sites/plans/jetpack-plans/convert-slug-terms';

describe( 'getYearlySlugFromMonthly', () => {
	test.each( [
		[ 'jetpack_personal_monthly', 'jetpack_personal' ],
		[ 'jetpack_premium_monthly', 'jetpack_premium' ],
		[ 'jetpack_business_monthly', 'jetpack_business' ],
		[ 'jetpack_anti_spam_monthly', 'jetpack_anti_spam' ],
		[ 'jetpack_backup_daily_monthly', 'jetpack_backup_daily' ],
		[ 'jetpack_backup_realtime_monthly', 'jetpack_backup_realtime' ],
		[ 'jetpack_scan_monthly', 'jetpack_scan' ],
		[ 'jetpack_search_monthly', 'jetpack_search' ],
		[ 'jetpack_security_daily_monthly', 'jetpack_security_daily' ],
		[ 'jetpack_security_realtime_monthly', 'jetpack_security_realtime' ],
		[ 'jetpack_complete_monthly', 'jetpack_complete' ],
	] )( 'returns yearly version of a monthly product/plan slug', ( monthlySlug ) => {
		// jetpack_scan_monthly => ['jetpack', 'scan', 'monthly']
		const slugParts = monthlySlug.split( '_' );
		// ['jetpack', 'scan', 'monthly'] => ['jetpack', 'scan'] => 'jetpack_scan'
		const slugWithoutTerm = slugParts.slice( 0, slugParts.length - 1 ).join( '_' );
		expect( getYearlySlugFromMonthly( monthlySlug ) ).toBe( slugWithoutTerm );
	} );

	test( 'returns the original slug when the slug is already the yearly version slug', () => {
		expect( getYearlySlugFromMonthly( 'jetpack_scan' ) ).toBe( 'jetpack_scan' );
	} );

	test( 'returns null when slug does not correspond to a Jetpack product', () => {
		expect( getYearlySlugFromMonthly( 'not_a_product' ) ).toBeNull();
	} );
} );
