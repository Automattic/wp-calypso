/**
 * Mocks
 */
jest.mock( 'calypso/state/products-list/selectors/get-product-cost' );

/**
 * Internal dependencies
 */
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
} from 'calypso/lib/plans/constants';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import { getAnnualBillingDiscount } from 'calypso/my-sites/plans-v2/utils';

let mockProductPrices;

function getPricesWithDiscountPercent( discountPercent ) {
	const monthlyPrice = 10;
	const yearlyPrice = monthlyPrice * 12 * ( 1 - discountPercent / 100 );

	return {
		monthly: monthlyPrice,
		yearly: yearlyPrice,
	};
}

describe( 'getAnnualBillingDiscount', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		mockProductPrices = {};
		getProductCost.mockImplementation( ( state, productSlug ) => mockProductPrices[ productSlug ] );
	} );

	test( 'returns rounded-down discount string when appropriate', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( 10.4 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( '10%' );
	} );

	test( 'returns rounded-up discount string when appropriate', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( 10.6 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( '11%' );
	} );

	test( 'returns null if monthly product cost is not found', () => {
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = 10;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if yearly product cost is not found', () => {
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = 10;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if monthly product cost is zero', () => {
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = 10;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = 0;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if yearly product cost is zero', () => {
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = 0;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = 10;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if discount would round to 0%', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( 0.4 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( null );
	} );

	test( 'returns null if discount is negative', () => {
		const { monthly, yearly } = getPricesWithDiscountPercent( -5 );

		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY ] = yearly;
		mockProductPrices[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] = monthly;

		const discount = getAnnualBillingDiscount();
		expect( discount ).toEqual( null );
	} );
} );
