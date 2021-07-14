import * as deprecate from '@wordpress/deprecated';
import { TIMELESS_PLAN_ECOMMERCE, TIMELESS_PLAN_FREE, FREE_PLAN_PRODUCT_ID } from '../constants';
import * as MockData from '../mock';
import * as Selectors from '../selectors';
import { buildPlanFeaturesDict } from '../test-utils';
import type { State } from '../reducer';

// Test data
const MOCK_LOCALE_1 = 'test-locale-1';
const MOCK_LOCALE_2 = 'test-locale-2';

const mockFeatures = {
	[ MOCK_LOCALE_1 ]: buildPlanFeaturesDict( [
		MockData.STORE_PLAN_FEATURE_CUSTOM_DOMAIN,
		MockData.STORE_PLAN_FEATURE_LIVE_SUPPORT,
	] ),
	[ MOCK_LOCALE_2 ]: buildPlanFeaturesDict( [
		MockData.STORE_PLAN_FEATURE_PRIORITY_SUPPORT,
		MockData.STORE_PLAN_FEATURE_RECURRING_PAYMENTS,
	] ),
};
const mockFeaturesByType = {
	[ MOCK_LOCALE_1 ]: [
		MockData.API_FEATURES_BY_TYPE_GENERAL,
		MockData.API_FEATURES_BY_TYPE_COMMERCE,
	],
	[ MOCK_LOCALE_2 ]: [
		MockData.API_FEATURES_BY_TYPE_GENERAL,
		MockData.API_FEATURES_BY_TYPE_MARKETING,
	],
};
const mockPlans = {
	[ MOCK_LOCALE_1 ]: [ MockData.STORE_PLAN_FREE, MockData.STORE_PLAN_PREMIUM ],
	[ MOCK_LOCALE_2 ]: [ MockData.STORE_PLAN_FREE ],
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

beforeEach( () => {
	jest.clearAllMocks();
} );

// Tests
describe( 'Plans selectors', () => {
	describe( 'getFeatures', () => {
		it( 'should select the right list of features for an given locale', () => {
			expect( Selectors.getFeatures( mockState, MOCK_LOCALE_1 ) ).toEqual(
				mockFeatures[ MOCK_LOCALE_1 ]
			);
			expect( Selectors.getFeatures( mockState, MOCK_LOCALE_2 ) ).toEqual(
				mockFeatures[ MOCK_LOCALE_2 ]
			);
		} );

		it( 'should return an empty object if the given locale does not exist in the store', () => {
			expect( Selectors.getFeatures( mockState, 'non-existing' ) ).toEqual( {} );
		} );
	} );

	describe( 'getFeaturesByType', () => {
		it( 'should select the right list of features by type for an given locale', () => {
			expect( Selectors.getFeaturesByType( mockState, MOCK_LOCALE_1 ) ).toEqual(
				mockFeaturesByType[ MOCK_LOCALE_1 ]
			);
			expect( Selectors.getFeaturesByType( mockState, MOCK_LOCALE_2 ) ).toEqual(
				mockFeaturesByType[ MOCK_LOCALE_2 ]
			);
		} );

		it( 'should return an empty array if the given locale does not exist in the store', () => {
			expect( Selectors.getFeaturesByType( mockState, 'non-existing' ) ).toEqual( [] );
		} );
	} );

	describe( 'getPlanByProductId', () => {
		it( 'should return undefined if the product ID is undefined', () => {
			expect( Selectors.getPlanByProductId( mockState, undefined, MOCK_LOCALE_1 ) ).toBeUndefined();
		} );

		it( 'should return undefined if the product ID is not associated to any products', () => {
			expect( Selectors.getPlanByProductId( mockState, -1, MOCK_LOCALE_1 ) ).toBeUndefined();
		} );

		it( 'should select the right product for a given correct product ID', () => {
			// Free
			expect(
				Selectors.getPlanByProductId(
					mockState,
					MockData.STORE_PRODUCT_FREE.productId,
					MOCK_LOCALE_1
				)
			).toEqual( MockData.STORE_PLAN_FREE );

			// Paid (annually billed)
			expect(
				Selectors.getPlanByProductId(
					mockState,
					MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.productId,
					MOCK_LOCALE_1
				)
			).toEqual( MockData.STORE_PLAN_PREMIUM );

			// Paid (monthly billed)
			expect(
				Selectors.getPlanByProductId(
					mockState,
					MockData.STORE_PRODUCT_PREMIUM_MONTHLY.productId,
					MOCK_LOCALE_1
				)
			).toEqual( MockData.STORE_PLAN_PREMIUM );
		} );

		it( 'should return undefined if the product ID does not exist for the given locale', () => {
			expect(
				Selectors.getPlanByProductId(
					mockState,
					MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.productId,
					MOCK_LOCALE_2
				)
			).toBeUndefined();
		} );
	} );

	describe( 'getPlanProductById', () => {
		it( 'should return undefined if the product ID is undefined', () => {
			expect( Selectors.getPlanProductById( mockState, undefined ) ).toBeUndefined();
		} );

		it( 'should return undefined if the product ID is not associated to any products', () => {
			// Non existing product
			expect( Selectors.getPlanProductById( mockState, -1 ) ).toBeUndefined();
		} );

		it( 'should select the right product for a given correct product ID', () => {
			// Free
			expect(
				Selectors.getPlanProductById( mockState, MockData.STORE_PRODUCT_FREE.productId )
			).toEqual( MockData.STORE_PRODUCT_FREE );

			// Paid (annually billed)
			expect(
				Selectors.getPlanProductById( mockState, MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.productId )
			).toEqual( MockData.STORE_PRODUCT_PREMIUM_ANNUALLY );
		} );

		it( 'should return undefined if the product ID does not match any products in the store', () => {
			// Existing Product, but not in store (monthly billed)
			expect(
				Selectors.getPlanProductById( mockState, MockData.STORE_PRODUCT_PREMIUM_MONTHLY.productId )
			).toBeUndefined();
		} );
	} );

	describe( 'getPlanByPeriodAgnosticSlug', () => {
		it( 'should return undefined if the plan slug is undefined', () => {
			expect(
				Selectors.getPlanByPeriodAgnosticSlug( mockState, undefined, MOCK_LOCALE_1 )
			).toBeUndefined();
		} );

		it( 'should return undefined if the plan slug does not match any plans in the store', () => {
			expect(
				Selectors.getPlanByPeriodAgnosticSlug( mockState, 'ecommerce', MOCK_LOCALE_1 )
			).toBeUndefined();
		} );

		it( 'should select the right plan for a given, correct plan slug and locale', () => {
			// Locale 1
			expect(
				Selectors.getPlanByPeriodAgnosticSlug(
					mockState,
					MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
					MOCK_LOCALE_1
				)
			).toEqual( MockData.STORE_PLAN_PREMIUM );

			// Locale 2
			expect(
				Selectors.getPlanByPeriodAgnosticSlug(
					mockState,
					MockData.STORE_PLAN_FREE.periodAgnosticSlug,
					MOCK_LOCALE_2
				)
			).toEqual( MockData.STORE_PLAN_FREE );
		} );

		it( 'should return undefined if the plan slug does not match any plans in the store for the given locale', () => {
			expect(
				Selectors.getPlanByPeriodAgnosticSlug(
					mockState,
					MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
					MOCK_LOCALE_2
				)
			).toBeUndefined();
		} );
	} );

	describe( 'getDefaultPaidPlan', () => {
		it( 'should select the correct default paid plan for the given locale', () => {
			expect( Selectors.getDefaultPaidPlan( mockState, MOCK_LOCALE_1 ) ).toEqual(
				MockData.STORE_PLAN_PREMIUM
			);
		} );

		it( 'should return undefined if the default paid plan is not available in the store for a given locale', () => {
			expect( Selectors.getDefaultPaidPlan( mockState, MOCK_LOCALE_2 ) ).toBeUndefined();
		} );
	} );

	describe( 'getDefaultFreePlan', () => {
		it( 'should select the correct default free plan for the given locale', () => {
			expect( Selectors.getDefaultFreePlan( mockState, MOCK_LOCALE_1 ) ).toEqual(
				MockData.STORE_PLAN_FREE
			);
			expect( Selectors.getDefaultFreePlan( mockState, MOCK_LOCALE_2 ) ).toEqual(
				MockData.STORE_PLAN_FREE
			);
		} );
	} );

	describe( 'getSupportedPlans', () => {
		it( 'should select the supported plans for a given locale', () => {
			expect( Selectors.getSupportedPlans( mockState, MOCK_LOCALE_1 ) ).toEqual(
				mockPlans[ MOCK_LOCALE_1 ]
			);
			expect( Selectors.getSupportedPlans( mockState, MOCK_LOCALE_2 ) ).toEqual(
				mockPlans[ MOCK_LOCALE_2 ]
			);
		} );

		it( 'should return an empty list if the given locale does not exist in the store', () => {
			expect( Selectors.getSupportedPlans( mockState, 'non-existing' ) ).toEqual( [] );
		} );
	} );

	describe( 'getPlansProducts', () => {
		it( 'should select all of the plans products from the store', () => {
			expect( Selectors.getPlansProducts( mockState ) ).toEqual( mockPlanProducts );
		} );
	} );

	describe( 'getPrices', () => {
		it( 'should select the prices for each plan product for a given locale', () => {
			const expectedPrices = {
				[ MockData.STORE_PRODUCT_FREE.storeSlug ]: MockData.STORE_PRODUCT_FREE.price,
				[ MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.storeSlug ]:
					MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.price,
			};
			expect( Selectors.getPrices( mockState, MOCK_LOCALE_1 ) ).toEqual( expectedPrices );
			expect( Selectors.getPrices( mockState, MOCK_LOCALE_2 ) ).toEqual( expectedPrices );
		} );

		it( 'should be marked as deprecated', () => {
			Selectors.getPrices( mockState, MOCK_LOCALE_1 );

			expect( deprecate ).toHaveBeenCalled();
			expect( deprecate ).toHaveBeenCalledWith( 'getPrices', {
				alternative: 'getPlanProduct().price',
			} );
		} );
	} );

	describe( 'getPlanByPath', () => {
		it( 'should return undefined if the plan slug is undefined', () => {
			expect( Selectors.getPlanByPath( mockState, undefined, MOCK_LOCALE_1 ) ).toBeUndefined();
		} );

		it( 'should return undefined if the plan slug does not match any plans in the store', () => {
			expect( Selectors.getPlanByPath( mockState, 'ecommerce', MOCK_LOCALE_1 ) ).toBeUndefined();
		} );

		it( 'should select the correct plan for the given locale', () => {
			expect(
				Selectors.getPlanByPath(
					mockState,
					MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.pathSlug,
					MOCK_LOCALE_1
				)
			).toEqual( MockData.STORE_PLAN_PREMIUM );
		} );

		it( 'should return undefined if the plan slug does not match any plans in the store for the given locale', () => {
			expect(
				Selectors.getPlanByPath(
					mockState,
					MockData.STORE_PRODUCT_PREMIUM_ANNUALLY.pathSlug,
					MOCK_LOCALE_2
				)
			).toBeUndefined();
		} );
	} );

	describe( 'getPlanProduct', () => {
		it( 'should return undefined if the plan slug is undefined', () => {
			expect( Selectors.getPlanProduct( mockState, undefined, 'ANNUALLY' ) ).toBeUndefined();
		} );

		it( 'should return undefined if the billing period is undefined', () => {
			expect(
				Selectors.getPlanProduct(
					mockState,
					MockData.STORE_PLAN_FREE.periodAgnosticSlug,
					undefined
				)
			).toBeUndefined();
		} );

		it( 'should select the free plan if the plan slug matches the free plan (regardless of the billing period)', () => {
			expect(
				Selectors.getPlanProduct(
					mockState,
					MockData.STORE_PLAN_FREE.periodAgnosticSlug,
					'ANNUALLY'
				)
			).toEqual( MockData.STORE_PRODUCT_FREE );
			expect(
				Selectors.getPlanProduct(
					mockState,
					MockData.STORE_PLAN_FREE.periodAgnosticSlug,
					'MONTHLY'
				)
			).toEqual( MockData.STORE_PRODUCT_FREE );
		} );

		it( 'should select the correct paid plan given the billing period', () => {
			expect(
				Selectors.getPlanProduct(
					mockState,
					MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
					'ANNUALLY'
				)
			).toEqual( MockData.STORE_PRODUCT_PREMIUM_ANNUALLY );
		} );

		it( 'should return undefined if there is not math in the store for the given plan slug and billing period', () => {
			expect(
				Selectors.getPlanProduct(
					mockState,
					MockData.STORE_PLAN_PREMIUM.periodAgnosticSlug,
					'MONTHLY'
				)
			).toBeUndefined();
		} );
	} );

	describe( 'isPlanEcommerce', () => {
		it( 'should return true if the eCommerce plan slug is passed', () => {
			expect( Selectors.isPlanEcommerce( mockState, TIMELESS_PLAN_ECOMMERCE ) ).toBe( true );
		} );
		it( 'should return false if the free plan slug is passed', () => {
			expect( Selectors.isPlanEcommerce( mockState, TIMELESS_PLAN_FREE ) ).toBe( false );
		} );
		it( 'should return false if the plan slug is undefined', () => {
			expect( Selectors.isPlanEcommerce( mockState ) ).toBe( false );
		} );
	} );

	describe( 'isPlanFree', () => {
		it( 'should return false if the eCommerce plan slug is passed', () => {
			expect( Selectors.isPlanFree( mockState, TIMELESS_PLAN_ECOMMERCE ) ).toBe( false );
		} );
		it( 'should return true if the free plan slug is passed', () => {
			expect( Selectors.isPlanFree( mockState, TIMELESS_PLAN_FREE ) ).toBe( true );
		} );
		it( 'should return false if the plan slug is undefined', () => {
			expect( Selectors.isPlanFree( mockState ) ).toBe( false );
		} );
	} );

	describe( 'isPlanProductFree', () => {
		it( 'should return true if the free plan product ID is passed', () => {
			expect( Selectors.isPlanProductFree( mockState, FREE_PLAN_PRODUCT_ID ) ).toBe( true );
		} );
		it( 'should return false if a product ID not associated to the free plan is passed', () => {
			expect( Selectors.isPlanProductFree( mockState, 2 ) ).toBe( false );
		} );
		it( 'should return false if the product ID is undefined', () => {
			expect( Selectors.isPlanProductFree( mockState ) ).toBe( false );
		} );
	} );
} );
