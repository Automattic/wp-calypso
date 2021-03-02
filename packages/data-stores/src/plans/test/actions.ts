/**
 * Internal dependencies
 */
import * as Actions from '../actions';
import * as MockData from '../mock';
import { buildPlanFeaturesDict } from '../test-utils';

const MOCK_LOCALE = 'test-locale';

describe( 'Plans action creators', () => {
	test( 'setFeatures', () => {
		const mockFeatures = buildPlanFeaturesDict( [
			MockData.STORE_PLAN_FEATURE_CUSTOM_DOMAIN,
			MockData.STORE_PLAN_FEATURE_LIVE_SUPPORT,
			MockData.STORE_PLAN_FEATURE_WORDADS,
		] );

		expect( Actions.setFeatures( mockFeatures, MOCK_LOCALE ) ).toEqual( {
			type: 'SET_FEATURES',
			features: mockFeatures,
			locale: MOCK_LOCALE,
		} );
	} );

	test( 'setFeaturesByType', () => {
		const features = [
			MockData.API_FEATURES_BY_TYPE_GENERAL,
			MockData.API_FEATURES_BY_TYPE_COMMERCE,
			MockData.API_FEATURES_BY_TYPE_MARKETING,
		];
		expect( Actions.setFeaturesByType( features, MOCK_LOCALE ) ).toEqual( {
			type: 'SET_FEATURES_BY_TYPE',
			featuresByType: features,
			locale: MOCK_LOCALE,
		} );
	} );

	test( 'setPlans', () => {
		const plans = [ MockData.STORE_PLAN_FREE, MockData.STORE_PLAN_PREMIUM ];
		expect( Actions.setPlans( plans, MOCK_LOCALE ) ).toEqual( {
			type: 'SET_PLANS',
			plans,
			locale: MOCK_LOCALE,
		} );
	} );

	test( 'setPlanProducts', () => {
		const planProducts = [
			MockData.STORE_PRODUCT_FREE,
			MockData.STORE_PRODUCT_PREMIUM_ANNUALLY,
			MockData.STORE_PRODUCT_PREMIUM_MONTHLY,
		];
		expect( Actions.setPlanProducts( planProducts ) ).toEqual( {
			type: 'SET_PLAN_PRODUCTS',
			products: planProducts,
		} );
	} );

	test( 'resetPlan', () => {
		expect( Actions.resetPlan() ).toEqual( {
			type: 'RESET_PLAN',
		} );
	} );
} );
