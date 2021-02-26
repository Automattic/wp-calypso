/**
 * External dependencies
 */
import * as deprecate from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import * as Selectors from '../selectors';
import * as MockData from '../mock';
import { buildPlanFeaturesDict } from '../test-utils';
import { TIMELESS_PLAN_ECOMMERCE, TIMELESS_PLAN_FREE, FREE_PLAN_PRODUCT_ID } from '../constants';
import type { State } from '../reducer';

// Test data
const TEST_LOCALE_1 = 'test-locale-1';
const TEST_LOCALE_2 = 'test-locale-2';

const mockFeatures = {
	[ TEST_LOCALE_1 ]: buildPlanFeaturesDict( [
		MockData.STORE_PLAN_FEATURE_CUSTOM_DOMAIN,
		MockData.STORE_PLAN_FEATURE_LIVE_SUPPORT,
	] ),
	[ TEST_LOCALE_2 ]: buildPlanFeaturesDict( [
		MockData.STORE_PLAN_FEATURE_PRIORITY_SUPPORT,
		MockData.STORE_PLAN_FEATURE_RECURRING_PAYMENTS,
	] ),
};
const mockFeaturesByType = {
	[ TEST_LOCALE_1 ]: [
		MockData.API_FEATURES_BY_TYPE_GENERAL,
		MockData.API_FEATURES_BY_TYPE_COMMERCE,
	],
	[ TEST_LOCALE_2 ]: [
		MockData.API_FEATURES_BY_TYPE_GENERAL,
		MockData.API_FEATURES_BY_TYPE_MARKETING,
	],
};
const mockPlans = {
	[ TEST_LOCALE_1 ]: [ MockData.STORE_PLAN_FREE, MockData.STORE_PLAN_PREMIUM ],
	[ TEST_LOCALE_2 ]: [ MockData.STORE_PLAN_FREE ],
};
const mockPlanProducts = [ MockData.STORE_PRODUCT_FREE, MockData.STORE_PRODUCT_PREMIUM_ANNUALLY ];

const mockState: State = {
	features: mockFeatures,
	featuresByType: mockFeaturesByType,
	plans: mockPlans,
	planProducts: mockPlanProducts,
};

// Mocks
jest.mock( '@wordpress/deprecated', () => {
	return jest.fn();
} );
jest.mock( '@wordpress/data', () => ( {
	// Mocking `select` allows unit tests to run in isolation for selectors,
	// without the corresponding resolvers being called
	select: () => ( {
		getPlansProducts: () => mockPlanProducts,
		getSupportedPlans: ( locale ) => mockPlans[ locale ] ?? [],
	} ),
} ) );

// Tests
describe( 'Plans selectors', () => {
	it( 'getFeatures', () => {
		expect( Selectors.getFeatures( mockState, TEST_LOCALE_1 ) ).toEqual(
			mockFeatures[ TEST_LOCALE_1 ]
		);
		expect( Selectors.getFeatures( mockState, TEST_LOCALE_2 ) ).toEqual(
			mockFeatures[ TEST_LOCALE_2 ]
		);
		expect( Selectors.getFeatures( mockState, 'non-existing' ) ).toEqual( {} );
	} );

	it( 'getFeaturesByType', () => {
		expect( Selectors.getFeaturesByType( mockState, TEST_LOCALE_1 ) ).toEqual(
			mockFeaturesByType[ TEST_LOCALE_1 ]
		);
		expect( Selectors.getFeaturesByType( mockState, TEST_LOCALE_2 ) ).toEqual(
			mockFeaturesByType[ TEST_LOCALE_2 ]
		);
		expect( Selectors.getFeaturesByType( mockState, 'non-existing' ) ).toEqual( [] );
	} );

	it( 'getPlanByProductId', () => {
		// Product Id not defined
		expect( Selectors.getPlanByProductId( mockState, undefined, TEST_LOCALE_1 ) ).toBeUndefined();

		// Non existing product
		expect( Selectors.getPlanByProductId( mockState, -1, TEST_LOCALE_1 ) ).toBeUndefined();

		// Existing Product (free)
		expect(
			Selectors.getPlanByProductId(
				mockState,
				MockData.STORE_PRODUCT_FREE.productId,
				TEST_LOCALE_1
			)
		).toEqual( MockData.STORE_PLAN_FREE );

		// Existing Product (annually billed)
		expect(
			Selectors.getPlanByProductId(
				mockState,
				MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.productId,
				TEST_LOCALE_1
			)
		).toEqual( MockData.STORE_PLAN_PREMIUM );

		// Existing Product (monthly billed)
		expect(
			Selectors.getPlanByProductId(
				mockState,
				MockData.STORE_PRODUCT_PREMIUM_MONTHLY.productId,
				TEST_LOCALE_1
			)
		).toEqual( MockData.STORE_PLAN_PREMIUM );

		// Existing Product, but not for the locale
		expect(
			Selectors.getPlanByProductId(
				mockState,
				MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.productId,
				TEST_LOCALE_2
			)
		).toBeUndefined();
	} );

	it( 'getPlanProductById', () => {
		// Product Id not defined
		expect( Selectors.getPlanProductById( mockState, undefined ) ).toBeUndefined();

		// Non existing product
		expect( Selectors.getPlanProductById( mockState, -1 ) ).toBeUndefined();

		// Existing Product (free)
		expect(
			Selectors.getPlanProductById( mockState, MockData.STORE_PRODUCT_FREE.productId )
		).toEqual( MockData.STORE_PRODUCT_FREE );

		// Existing Product (annually billed)
		expect(
			Selectors.getPlanProductById( mockState, MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.productId )
		).toEqual( MockData.STORE_PRODUCT_PREMIUM_ANNUALLY );

		// Existing Product, but not in store (monthly billed)
		expect(
			Selectors.getPlanProductById( mockState, MockData.STORE_PRODUCT_PREMIUM_MONTHLY.productId )
		).toBeUndefined();
	} );

	it( 'getPlanByPeriodAgnosticSlug', () => {
		// Plan slug is undefined
		expect(
			Selectors.getPlanByPeriodAgnosticSlug( mockState, undefined, TEST_LOCALE_1 )
		).toBeUndefined();

		// A plan that doesn't exist in the mock APIs
		expect(
			Selectors.getPlanByPeriodAgnosticSlug( mockState, 'ecommerce', TEST_LOCALE_1 )
		).toBeUndefined();

		// A plan that exists in the store, for locale 1
		expect(
			Selectors.getPlanByPeriodAgnosticSlug(
				mockState,
				MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
				TEST_LOCALE_1
			)
		).toEqual( MockData.STORE_PLAN_PREMIUM );

		// A plan that exists in the store, for locale 2
		expect(
			Selectors.getPlanByPeriodAgnosticSlug(
				mockState,
				MockData.STORE_PLAN_FREE.periodAgnosticSlug,
				TEST_LOCALE_2
			)
		).toEqual( MockData.STORE_PLAN_FREE );

		// Plan exists in the store, but not for locale 2
		expect(
			Selectors.getPlanByPeriodAgnosticSlug(
				mockState,
				MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
				TEST_LOCALE_2
			)
		).toBeUndefined();
	} );

	it( 'getDefaultPaidPlan', () => {
		// The store has the default paid plan for the selected locale
		expect( Selectors.getDefaultPaidPlan( mockState, TEST_LOCALE_1 ) ).toEqual(
			MockData.STORE_PLAN_PREMIUM
		);

		// The store doesn't have the default paid plan for the selected locale
		expect( Selectors.getDefaultPaidPlan( mockState, TEST_LOCALE_2 ) ).toBeUndefined();
	} );

	it( 'getDefaultFreePlan', () => {
		expect( Selectors.getDefaultFreePlan( mockState, TEST_LOCALE_1 ) ).toEqual(
			MockData.STORE_PLAN_FREE
		);
		expect( Selectors.getDefaultFreePlan( mockState, TEST_LOCALE_2 ) ).toEqual(
			MockData.STORE_PLAN_FREE
		);
	} );

	it( 'getSupportedPlans', () => {
		expect( Selectors.getSupportedPlans( mockState, TEST_LOCALE_1 ) ).toEqual(
			mockPlans[ TEST_LOCALE_1 ]
		);
		expect( Selectors.getSupportedPlans( mockState, TEST_LOCALE_2 ) ).toEqual(
			mockPlans[ TEST_LOCALE_2 ]
		);
		expect( Selectors.getSupportedPlans( mockState, 'non-existing' ) ).toEqual( [] );
	} );

	it( 'getPlansProducts', () => {
		expect( Selectors.getPlansProducts( mockState ) ).toEqual( mockPlanProducts );
	} );

	it( 'getPrices', () => {
		const expectedPrices = {
			[ MockData.STORE_PRODUCT_FREE.storeSlug ]: MockData.STORE_PRODUCT_FREE.price,
			[ MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.storeSlug ]:
				MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.price,
		};
		expect( Selectors.getPrices( mockState, TEST_LOCALE_1 ) ).toEqual( expectedPrices );
		expect( Selectors.getPrices( mockState, TEST_LOCALE_2 ) ).toEqual( expectedPrices );

		// Make sure function is correctly flagged as deprecated
		const expectedCallArguments = [
			'getPrices',
			{
				alternative: 'getPlanProduct().price',
			},
		];
		expect( deprecate ).toHaveBeenCalledTimes( 2 );
		expect( deprecate ).toHaveBeenNthCalledWith( 1, ...expectedCallArguments );
		expect( deprecate ).toHaveBeenNthCalledWith( 2, ...expectedCallArguments );
	} );

	it( 'getPlanByPath', () => {
		// Plan path (product slug) is undefined
		expect( Selectors.getPlanByPath( mockState, undefined, TEST_LOCALE_1 ) ).toBeUndefined();

		// Plan path (product slug) exists, but not currently in the store
		expect( Selectors.getPlanByPath( mockState, 'ecommerce', TEST_LOCALE_1 ) ).toBeUndefined();

		// Plan path (product slug) exists and there's a matching plan for the locale
		expect(
			Selectors.getPlanByPath(
				mockState,
				MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.pathSlug,
				TEST_LOCALE_1
			)
		).toEqual( MockData.STORE_PLAN_PREMIUM );

		// Plan path (product slug) exists but there isn't a matching plan for the locale
		expect(
			Selectors.getPlanByPath(
				mockState,
				MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.pathSlug,
				TEST_LOCALE_2
			)
		).toBeUndefined();
	} );

	it( 'getPlanProduct', () => {
		// undefined plan slug
		expect( Selectors.getPlanProduct( mockState, undefined, 'ANNUALLY' ) ).toBeUndefined();

		// undefined billing period
		expect(
			Selectors.getPlanProduct( mockState, MockData.STORE_PLAN_FREE.periodAgnosticSlug, undefined )
		).toBeUndefined();

		// free plan (regardless of the billing period)
		expect(
			Selectors.getPlanProduct( mockState, MockData.STORE_PLAN_FREE.periodAgnosticSlug, 'ANNUALLY' )
		).toEqual( MockData.STORE_PRODUCT_FREE );
		expect(
			Selectors.getPlanProduct( mockState, MockData.STORE_PLAN_FREE.periodAgnosticSlug, 'MONTHLY' )
		).toEqual( MockData.STORE_PRODUCT_FREE );

		// paid plan, annually billed is correctly found in the store
		expect(
			Selectors.getPlanProduct(
				mockState,
				MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
				'ANNUALLY'
			)
		).toEqual( MockData.STORE_PRODUCT_PREMIUM_ANNUALLY );

		// periodAgnosticSlug is not free, monthly doesn't exist in the store
		expect(
			Selectors.getPlanProduct(
				mockState,
				MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
				'MONTHLY'
			)
		).toBeUndefined();
	} );

	it( 'isPlanEcommerce', () => {
		expect( Selectors.isPlanEcommerce( mockState, TIMELESS_PLAN_ECOMMERCE ) ).toBe( true );
		expect( Selectors.isPlanEcommerce( mockState, TIMELESS_PLAN_FREE ) ).toBe( false );
		expect( Selectors.isPlanEcommerce( mockState ) ).toBe( false );
	} );

	it( 'isPlanFree', () => {
		expect( Selectors.isPlanFree( mockState, TIMELESS_PLAN_ECOMMERCE ) ).toBe( false );
		expect( Selectors.isPlanFree( mockState, TIMELESS_PLAN_FREE ) ).toBe( true );
		expect( Selectors.isPlanFree( mockState ) ).toBe( false );
	} );

	it( 'isPlanProductFree', () => {
		expect( Selectors.isPlanProductFree( mockState, FREE_PLAN_PRODUCT_ID ) ).toBe( true );
		expect( Selectors.isPlanProductFree( mockState, 2 ) ).toBe( false );
		expect( Selectors.isPlanProductFree( mockState ) ).toBe( false );
	} );
} );
