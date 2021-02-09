/**
 * Mocks
 */
jest.mock( 'calypso/state/products-list/selectors/get-product-cost' );
jest.mock( 'calypso/state/current-user/selectors' );
// Prevent `ReferenceError: window is not defined`
jest.mock( '../i5/products-grid-i5', () => null );

/**
 * Internal dependencies
 */
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from 'calypso/lib/plans/constants';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import { getHighestAnnualDiscount } from 'calypso/my-sites/plans/jetpack-plans/utils';

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
