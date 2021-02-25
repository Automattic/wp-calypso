/**
 * Internal dependencies
 */
import { setFeatures, setFeaturesByType, setPlans, setPlanProducts, resetPlan } from '../actions';
import {
	MOCK_FEATURES_BY_TYPE_GENERAL,
	MOCK_FEATURES_BY_TYPE_COMMERCE,
	MOCK_FEATURES_BY_TYPE_MARKETING,
	MOCK_PLAN_FREE,
	MOCK_PLAN_PREMIUM,
	MOCK_PLAN_PRODUCT_FREE,
	MOCK_PLAN_PRODUCT_PREMIUM_ANNUALLY,
	MOCK_PLAN_PRODUCT_PREMIUM_MONTHLY,
} from '../mock/mock-constants';

// TODO: consider splitting files in mock/ folder
// and exporting everything through index file

// TODO: consider extracting to mock/
const TEST_LOCALE = 'test-locale';
const TEST_FEATURE = {
	id: 'test-id',
	description: 'test-description',
	name: 'test-name',
	requiresAnnuallyBilledPlan: true,
	type: 'test-type',
	data: [ false, 'test' ],
};

describe( 'Plans action creators', () => {
	test( 'SET_FEATURES', () => {
		const mockFeatures = {
			test: TEST_FEATURE,
		};

		expect( setFeatures( mockFeatures, TEST_LOCALE ) ).toEqual( {
			type: 'SET_FEATURES',
			features: mockFeatures,
			locale: TEST_LOCALE,
		} );
	} );

	test( 'SET_FEATURES_BY_TYPE', () => {
		const features = [
			MOCK_FEATURES_BY_TYPE_GENERAL,
			MOCK_FEATURES_BY_TYPE_COMMERCE,
			MOCK_FEATURES_BY_TYPE_MARKETING,
		];
		expect( setFeaturesByType( features, TEST_LOCALE ) ).toEqual( {
			type: 'SET_FEATURES_BY_TYPE',
			featuresByType: features,
			locale: TEST_LOCALE,
		} );
	} );

	test( 'SET_PLANS', () => {
		const plans = [ MOCK_PLAN_FREE, MOCK_PLAN_PREMIUM ];
		expect( setPlans( plans, TEST_LOCALE ) ).toEqual( {
			type: 'SET_PLANS',
			plans,
			locale: TEST_LOCALE,
		} );
	} );

	test( 'SET_PLAN_PRODUCTS', () => {
		const planProducts = [
			MOCK_PLAN_PRODUCT_FREE,
			MOCK_PLAN_PRODUCT_PREMIUM_ANNUALLY,
			MOCK_PLAN_PRODUCT_PREMIUM_MONTHLY,
		];
		expect( setPlanProducts( planProducts ) ).toEqual( {
			type: 'SET_PLAN_PRODUCTS',
			products: planProducts,
		} );
	} );

	test( 'RESET_PLAN', () => {
		expect( resetPlan() ).toEqual( {
			type: 'RESET_PLAN',
		} );
	} );
} );
