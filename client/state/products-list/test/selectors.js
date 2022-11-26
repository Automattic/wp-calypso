import { TERM_MONTHLY } from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import {
	computeFullAndMonthlyPricesForPlan,
	getPlanPrice,
	getProductDisplayCost,
	getProductSaleCouponCost,
	getProductSaleCouponDiscount,
	getProductPriceTierList,
	isProductsListFetching,
	getProductsByBillingSlug,
} from '../selectors';

jest.mock( 'calypso/state/selectors/get-intro-offer-price', () => jest.fn() );
jest.mock( 'calypso/state/selectors/get-intro-offer-is-eligible', () => jest.fn() );
jest.mock( 'calypso/state/selectors/get-intro-offer-is-eligible', () => jest.fn() );

jest.mock( 'calypso/state/products-list/selectors/get-product-sale-coupon-cost', () => ( {
	getProductSaleCouponCost: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/products-list/selectors/get-product-sale-coupon-discount', () => ( {
	getProductSaleCouponDiscount: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/products-list/selectors/get-product-price-tiers', () => ( {
	getProductPriceTierList: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getPlanDiscountedRawPrice: jest.fn(),
	isIntroductoryOfferAppliedToPlanPrice: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	applyTestFiltersToPlansList: jest.fn( ( x ) => x ),
	getPlan: jest.fn(),
} ) );

jest.mock( 'calypso/state/plans/selectors', () => ( {
	getPlanRawPrice: jest.fn(),
} ) );

describe( 'selectors', () => {
	describe( '#getPlanPrice()', () => {
		beforeEach( () => {
			getPlanDiscountedRawPrice.mockReset();
			getPlanDiscountedRawPrice.mockImplementation( () => 12 );

			getPlanRawPrice.mockReset();
			getPlanRawPrice.mockImplementation( () => 50 );
		} );

		test( 'Should return discounted price if available', () => {
			const plan = { getStoreSlug: () => 'abc' };
			expect( getPlanPrice( {}, 1, plan ) ).toBe( 12 );
		} );

		test( 'Should pass correct arguments to getPlanDiscountedRawPrice', () => {
			const plan = { getStoreSlug: () => 'abc' };
			getPlanPrice( { state: 1 }, 1, plan, false );
			expect( getPlanDiscountedRawPrice.mock.calls[ 0 ] ).toEqual( [
				{ state: 1 },
				1,
				'abc',
				{ isMonthly: false },
			] );
		} );

		test( 'Should return raw price if no discount available', () => {
			getPlanDiscountedRawPrice.mockImplementation( () => null );

			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			expect( getPlanPrice( {}, 1, plan, false ) ).toBe( 50 );
		} );

		test( 'Should pass correct arguments to getPlanRawPrice', () => {
			getPlanDiscountedRawPrice.mockImplementation( () => null );

			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getPlanPrice( { state: 1 }, 1, plan, false );
			expect( getPlanRawPrice.mock.calls[ 0 ] ).toEqual( [ { state: 1 }, 'def', false ] );
		} );

		test( 'Should pass correct isMonthly value', () => {
			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getPlanPrice( {}, 1, plan, false );
			expect( getPlanDiscountedRawPrice.mock.calls[ 0 ][ 3 ] ).toEqual( { isMonthly: false } );

			getPlanPrice( {}, 1, plan, true );
			expect( getPlanDiscountedRawPrice.mock.calls[ 1 ][ 3 ] ).toEqual( { isMonthly: true } );

			getPlanPrice( {}, 1, { ...plan, term: TERM_MONTHLY }, true );
			expect( getPlanDiscountedRawPrice.mock.calls[ 2 ][ 3 ] ).toEqual( { isMonthly: true } );
		} );
	} );

	describe( '#computeFullAndMonthlyPricesForPlan()', () => {
		beforeEach( () => {
			getIntroOfferPrice.mockReset();
			getIntroOfferPrice.mockImplementation( () => null );
			getIntroOfferIsEligible.mockReset();
			getIntroOfferIsEligible.mockImplementation( () => false );
			getProductSaleCouponCost.mockReset();
			getProductSaleCouponCost.mockImplementation( () => false );
			getProductSaleCouponDiscount.mockReset();
			getProductSaleCouponDiscount.mockImplementation( () => false );
		} );
		test( 'Should return shape { priceFull }', () => {
			getPlanDiscountedRawPrice.mockImplementation( ( a, b, c, { isMonthly } ) =>
				isMonthly ? 10 : 120
			);
			getPlanRawPrice.mockImplementation( () => 150 );

			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan ) ).toEqual( {
				introductoryOfferPrice: null,
				priceFull: 120,
				priceFinal: 120,
			} );
		} );

		test( 'Should return the introductoryOfferPrice value', () => {
			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getIntroOfferPrice.mockImplementation( () => 60 );
			getIntroOfferIsEligible.mockImplementation( () => true );
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan ) ).toEqual( {
				introductoryOfferPrice: 60,
				priceFull: 120,
				priceFinal: 120,
			} );
		} );

		test( 'Should not return the introductoryOfferPrice value if ineligible', () => {
			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getIntroOfferPrice.mockImplementation( () => 60 );
			getIntroOfferIsEligible.mockImplementation( () => false );
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan ) ).toEqual( {
				introductoryOfferPrice: null,
				priceFull: 120,
				priceFinal: 120,
			} );
		} );

		test( 'Should return the correct tier 1 price for Jetpack Search product with < 100 posts', () => {
			const SEARCH_PRICE_TIER_LIST = [
				{
					minimum_units: 0,
					maximum_units: null,
					transform_quantity_divide_by: 10000,
					transform_quantity_round: 'up',
					per_unit_fee: 896,
				},
			];
			const plan = { getStoreSlug: () => 'jetpack_search', getProductId: () => '2104' };
			// JP Search is a "product" not a plan, so `getPlanDiscountedRawPrice()` & `getPlanRawPrice()` should return null.
			getPlanDiscountedRawPrice.mockImplementation( () => null );
			getPlanRawPrice.mockImplementation( () => null );

			getIntroOfferPrice.mockImplementation( () => null );
			getIntroOfferIsEligible.mockImplementation( () => false );
			getProductPriceTierList.mockImplementation( () => SEARCH_PRICE_TIER_LIST );
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan, 10 ) ).toEqual( {
				introductoryOfferPrice: null,
				priceFull: 8.96,
				priceFinal: 8.96,
			} );
		} );

		test( 'Should return the correct tier 2 price for Jetpack Search product with > 100 posts', () => {
			const SEARCH_PRICE_TIER_LIST = [
				{
					minimum_units: 0,
					maximum_units: null,
					transform_quantity_divide_by: 10000,
					transform_quantity_round: 'up',
					per_unit_fee: 896,
				},
			];
			const plan = { getStoreSlug: () => 'jetpack_search', getProductId: () => '2104' };
			// JP Search is a "product" not a plan, so `getPlanDiscountedRawPrice()` & `getPlanRawPrice()` should return null.
			getPlanDiscountedRawPrice.mockImplementation( () => null );
			getPlanRawPrice.mockImplementation( () => null );

			getIntroOfferPrice.mockImplementation( () => null );
			getIntroOfferIsEligible.mockImplementation( () => false );
			getProductPriceTierList.mockImplementation( () => SEARCH_PRICE_TIER_LIST );
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan, 10001 ) ).toEqual( {
				introductoryOfferPrice: null,
				priceFull: 17.92,
				priceFinal: 17.92,
			} );
		} );
	} );

	describe( '#getProductDisplayCost()', () => {
		test( 'should return null when the products list has not been fetched', () => {
			const state = deepFreeze( { productsList: { items: {} } } );

			expect( getProductDisplayCost( state, 'business-bundle' ) ).toBe( null );
		} );

		test( 'should return the display cost', () => {
			const state = deepFreeze( {
				productsList: {
					items: {
						'business-bundle': {
							cost_display: 'A$169.00',
						},
					},
				},
			} );

			expect( getProductDisplayCost( state, 'business-bundle' ) ).toBe( 'A$169.00' );
		} );
	} );

	describe( '#isProductsListFetching()', () => {
		test( 'should return false when productsList.isFetching is false', () => {
			const state = { productsList: { isFetching: false } };
			expect( isProductsListFetching( state ) ).toBe( false );
		} );

		test( 'should return true when productsList.isFetching is true', () => {
			const state = { productsList: { isFetching: true } };
			expect( isProductsListFetching( state ) ).toBe( true );
		} );
	} );

	describe( '#getProductsByBillingSlug()', () => {
		const billingSlug = 'wp-mp-theme-tsubaki-test';

		const tsubaki = {
			product_id: 3001,
			product_name: 'Tsubaki Third-Party Test',
			product_slug: 'wp_mp_theme_tsubaki_test_yearly',
			description: '',
			product_type: 'marketplace_theme',
			available: true,
			billing_product_slug: 'wp-mp-theme-tsubaki-test',
			is_domain_registration: false,
			cost_display: 'US$100.00',
			combined_cost_display: 'US$100.00',
			cost: 100,
			cost_smallest_unit: 10000,
			currency_code: 'USD',
			price_tier_list: [],
			price_tier_usage_quantity: null,
			product_term: 'year',
			price_tiers: [],
			price_tier_slug: '',
		};

		const items = {
			wp_mp_theme_tsubaki_test_yearly: tsubaki,
		};

		test( 'Should return undefined if the items are empty', () => {
			const state = {
				productsList: {
					items: {},
				},
			};

			expect( getProductsByBillingSlug( state, billingSlug ) ).toBeUndefined();
		} );

		test( 'Should return undefined if the billing slug is not defined', () => {
			const state = {
				productsList: {
					items,
				},
			};

			expect( getProductsByBillingSlug( state ) ).toBeUndefined();
		} );

		test( 'Should return the list of products containing tsubaki', () => {
			const state = {
				productsList: {
					items,
				},
			};

			const productsBySlug = getProductsByBillingSlug( state, billingSlug );

			expect( productsBySlug[ 0 ] ).toBe( tsubaki );
		} );
	} );
} );
