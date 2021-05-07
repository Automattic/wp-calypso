/**
 * Mocks
 */
jest.mock( 'calypso/state/products-list/selectors/get-product-cost' );
jest.mock( 'calypso/state/current-user/selectors' );
// Prevent `ReferenceError: window is not defined`
jest.mock( '../product-grid', () => null );

/**
 * Internal dependencies
 */
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from '@automattic/calypso-products';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import {
	getHighestAnnualDiscount,
	getMonthlySlugFromYearly,
	getYearlySlugFromMonthly,
} from 'calypso/my-sites/plans/jetpack-plans/utils';

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
	const yearlySlugs = [
		'jetpack_personal',
		'jetpack_premium',
		'jetpack_business',
		'jetpack_anti_spam',
		'jetpack_backup_daily',
		'jetpack_backup_realtime',
		'jetpack_scan',
		'jetpack_search',
		'jetpack_security_daily',
		'jetpack_security_realtime',
		'jetpack_complete',
	];

	yearlySlugs.forEach( ( slug ) => {
		test( `returns ${ slug } monthly version`, () => {
			expect( getMonthlySlugFromYearly( slug ) ).toBe( `${ slug }_monthly` );
		} );
	} );

	test( 'returns null when the slug is already the yearly version slug', () => {
		expect( getMonthlySlugFromYearly( 'jetpack_scan_monthly' ) ).toBeNull();
	} );

	test( 'returns null when slug does not correspond to a Jetpack product', () => {
		expect( getMonthlySlugFromYearly( 'not_a_product' ) ).toBeNull();
	} );
} );

describe( 'getYearlySlugFromMonthly', () => {
	const monthlySlugs = [
		'jetpack_personal_monthly',
		'jetpack_premium_monthly',
		'jetpack_business_monthly',
		'jetpack_anti_spam_monthly',
		'jetpack_backup_daily_monthly',
		'jetpack_backup_realtime_monthly',
		'jetpack_scan_monthly',
		'jetpack_search_monthly',
		'jetpack_security_daily_monthly',
		'jetpack_security_realtime_monthly',
		'jetpack_complete_monthly',
	];

	monthlySlugs.forEach( ( slug ) => {
		test( `returns ${ slug } yearly version`, () => {
			// jetpack_scan_monthly => ['jetpack', 'scan', 'monthly']
			const slugParts = slug.split( '_' );
			// ['jetpack', 'scan', 'monthly'] => ['jetpack', 'scan'] => 'jetpack_scan'
			const slugWithoutTerm = slugParts.slice( 0, slugParts.length - 1 ).join( '_' );
			expect( getYearlySlugFromMonthly( slug ) ).toBe( slugWithoutTerm );
		} );
	} );

	test( 'returns null when the slug is already the yearly version slug', () => {
		expect( getYearlySlugFromMonthly( 'jetpack_scan' ) ).toBeNull();
	} );

	test( 'returns null when slug does not correspond to a Jetpack product', () => {
		expect( getYearlySlugFromMonthly( 'not_a_product' ) ).toBeNull();
	} );
} );
