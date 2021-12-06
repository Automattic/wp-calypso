/**
 * Mocks
 */
jest.mock( 'calypso/state/products-list/selectors/get-product-cost' );
jest.mock( 'calypso/state/currency-code/selectors' );
// Prevent `ReferenceError: window is not defined`
jest.mock( '../product-grid', () => null );

import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from '@automattic/calypso-products';
import {
	getMonthlySlugFromYearly,
	getYearlySlugFromMonthly,
} from 'calypso/my-sites/plans/jetpack-plans/convert-slug-terms';
import getHighestAnnualDiscount from 'calypso/my-sites/plans/jetpack-plans/plans-filter-bar/get-highest-annual-discount';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';

let mockProductPrices;

function getPricesWithDiscountPercent( discountPercent ) {
	const monthlyPrice = 10;
	const yearlyPrice = monthlyPrice * 12 * ( 1 - discountPercent / 100 );

	return {
		monthly: monthlyPrice,
		yearly: yearlyPrice,
	};
}

describe( 'getHighestAnnualDiscount', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		mockProductPrices = {};
		getProductCost.mockImplementation( ( state, productSlug ) => mockProductPrices[ productSlug ] );
	} );

	test( 'returns the highest available discount', () => {
		const securityDailyPrices = getPricesWithDiscountPercent( 5 );
		const securityRealtimePrices = getPricesWithDiscountPercent( 10 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = securityDailyPrices.yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = securityDailyPrices.monthly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_REALTIME ] = securityRealtimePrices.yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ] = securityRealtimePrices.monthly;

		const highestDiscount = getHighestAnnualDiscount( null, [
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_REALTIME,
		] );
		expect( highestDiscount ).toEqual( '10%' );
	} );

	test( 'returns rounded-down discount string when appropriate', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( 10.4 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getHighestAnnualDiscount( null, [ PLAN_JETPACK_SECURITY_DAILY ] );
		expect( discount ).toEqual( '10%' );
	} );

	test( 'returns rounded-up discount string when appropriate', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( 10.6 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getHighestAnnualDiscount( null, [ PLAN_JETPACK_SECURITY_DAILY ] );
		expect( discount ).toEqual( '11%' );
	} );

	test( 'returns null if no slugs are provided', () => {
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = 10;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = 1;

		const discount = getHighestAnnualDiscount( null, [] );
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if no pricing info is found', () => {
		const discount = getHighestAnnualDiscount( null, [ PLAN_JETPACK_SECURITY_DAILY ] );
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if highest discount would round to 0%', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( 0.4 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getHighestAnnualDiscount( null, [ PLAN_JETPACK_SECURITY_DAILY ] );
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if highest discount is negative', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( -5 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getHighestAnnualDiscount( null, [ PLAN_JETPACK_SECURITY_DAILY ] );
		expect( discount ).toEqual( null );
	} );
} );

describe( 'getMonthlySlugFromYearly', () => {
	test.each( [
		[ 'jetpack_personal', 'jetpack_personal_monthly' ],
		[ 'jetpack_premium', 'jetpack_premium_monthly' ],
		[ 'jetpack_business', 'jetpack_business_monthly' ],
		[ 'jetpack_anti_spam', 'jetpack_anti_spam_monthly' ],
		[ 'jetpack_backup_daily', 'jetpack_backup_daily_monthly' ],
		[ 'jetpack_backup_realtime', 'jetpack_backup_realtime_monthly' ],
		[ 'jetpack_scan', 'jetpack_scan_monthly' ],
		[ 'jetpack_search', 'jetpack_search_monthly' ],
		[ 'jetpack_security_daily', 'jetpack_security_daily_monthly' ],
		[ 'jetpack_security_realtime', 'jetpack_security_realtime_monthly' ],
		[ 'jetpack_complete', 'jetpack_complete_monthly' ],
	] )( 'returns monthly version of a yearly product/plan slug', ( yearlySlug ) => {
		expect( getMonthlySlugFromYearly( yearlySlug ) ).toBe( `${ yearlySlug }_monthly` );
	} );

	test( 'returns the original slug when the slug is already the yearly version slug', () => {
		expect( getMonthlySlugFromYearly( 'jetpack_scan_monthly' ) ).toBe( 'jetpack_scan_monthly' );
	} );

	test( 'returns null when slug does not correspond to a Jetpack product', () => {
		expect( getMonthlySlugFromYearly( 'not_a_product' ) ).toBeNull();
	} );
} );

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
