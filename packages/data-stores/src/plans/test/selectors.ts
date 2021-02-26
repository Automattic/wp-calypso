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

// Mocks
jest.mock( '@wordpress/deprecated', () => {
	return jest.fn();
} );

// Test data
const TEST_LOCALE_1 = 'test-locale-1';
const TEST_LOCALE_2 = 'test-locale-2';

const testFeatures = {
	[ TEST_LOCALE_1 ]: buildPlanFeaturesDict( [
		MockData.STORE_PLAN_FEATURE_CUSTOM_DOMAIN,
		MockData.STORE_PLAN_FEATURE_LIVE_SUPPORT,
	] ),
	[ TEST_LOCALE_2 ]: buildPlanFeaturesDict( [
		MockData.STORE_PLAN_FEATURE_PRIORITY_SUPPORT,
		MockData.STORE_PLAN_FEATURE_RECURRING_PAYMENTS,
	] ),
};
const testFeaturesByType = {
	[ TEST_LOCALE_1 ]: [
		MockData.API_FEATURES_BY_TYPE_GENERAL,
		MockData.API_FEATURES_BY_TYPE_COMMERCE,
	],
	[ TEST_LOCALE_2 ]: [
		MockData.API_FEATURES_BY_TYPE_GENERAL,
		MockData.API_FEATURES_BY_TYPE_MARKETING,
	],
};
const testPlans = {
	[ TEST_LOCALE_1 ]: [ MockData.STORE_PLAN_FREE, MockData.STORE_PLAN_PREMIUM ],
	[ TEST_LOCALE_2 ]: [ MockData.STORE_PLAN_FREE ],
};
const testPlanProducts = [ MockData.STORE_PRODUCT_FREE, MockData.STORE_PRODUCT_PREMIUM_ANNUALLY ];

const mockState: State = {
	features: testFeatures,
	featuresByType: testFeaturesByType,
	plans: testPlans,
	planProducts: testPlanProducts,
};

// Tests
describe( 'Plans selectors', () => {
	it( 'getFeatures', () => {
		expect( Selectors.getFeatures( mockState, TEST_LOCALE_1 ) ).toEqual(
			testFeatures[ TEST_LOCALE_1 ]
		);
		expect( Selectors.getFeatures( mockState, TEST_LOCALE_2 ) ).toEqual(
			testFeatures[ TEST_LOCALE_2 ]
		);
		expect( Selectors.getFeatures( mockState, 'non-existing' ) ).toEqual( {} );
	} );

	it( 'getFeaturesByType', () => {
		expect( Selectors.getFeaturesByType( mockState, TEST_LOCALE_1 ) ).toEqual(
			testFeaturesByType[ TEST_LOCALE_1 ]
		);
		expect( Selectors.getFeaturesByType( mockState, TEST_LOCALE_2 ) ).toEqual(
			testFeaturesByType[ TEST_LOCALE_2 ]
		);
		expect( Selectors.getFeaturesByType( mockState, 'non-existing' ) ).toEqual( [] );
	} );

	it( 'getPlanByProductId', () => {
		expect( 1 ).toBeTruthy();
	} );

	it( 'getPlanProductById', () => {
		expect( 1 ).toBeTruthy();
	} );

	it( 'getPlanByPeriodAgnosticSlug', () => {
		expect( 1 ).toBeTruthy();
	} );

	it( 'getDefaultPaidPlan', () => {
		expect( 1 ).toBeTruthy();
	} );

	it( 'getDefaultFreePlan', () => {
		expect( 1 ).toBeTruthy();
	} );

	it( 'getSupportedPlans', () => {
		expect( Selectors.getSupportedPlans( mockState, TEST_LOCALE_1 ) ).toEqual(
			testPlans[ TEST_LOCALE_1 ]
		);
		expect( Selectors.getSupportedPlans( mockState, TEST_LOCALE_2 ) ).toEqual(
			testPlans[ TEST_LOCALE_2 ]
		);
		expect( Selectors.getSupportedPlans( mockState, 'non-existing' ) ).toEqual( [] );
	} );

	it( 'getPlansProducts', () => {
		expect( Selectors.getPlansProducts( mockState ) ).toEqual( testPlanProducts );
	} );

	it( 'getPrices', () => {
		expect( 1 ).toBeTruthy();
	} );

	it( 'getPlanByPath', () => {
		expect( 1 ).toBeTruthy();
	} );

	it( 'getPlanProduct', () => {
		expect( 1 ).toBeTruthy();
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
