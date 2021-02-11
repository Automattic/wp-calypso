/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { setPlans, setFeaturesByType, setFeatures, setPlanProducts } from '../actions';
import { PLAN_FREE, PLAN_PREMIUM } from '../constants';
import {
	MOCK_PLAN_FREE,
	MOCK_PLAN_PRODUCT_FREE,
	MOCK_PLAN_PRODUCT_PREMIUM_ANNUALLY,
	MOCK_PLAN_PRODUCT_PREMIUM_MONTHLY,
	MOCK_FEATURES_BY_TYPE_GENERAL,
	MOCK_FEATURES_BY_TYPE_COMMERCE,
	MOCK_FEATURES_BY_TYPE_MARKETING,
	MOCK_SIMPLIFIED_FEATURE_CUSTOM_DOMAIN,
	MOCK_SIMPLIFIED_FEATURE_LIVE_SUPPORT,
	MOCK_SIMPLIFIED_FEATURE_PRIORITY_SUPPORT,
} from '../mock/mock-constants';

const LOCALE_EN = 'en';

describe( 'Plans reducer', () => {
	describe( 'Plans', () => {
		it( 'defaults to no plans info', () => {
			const { plans } = reducer( undefined, { type: 'NOOP' } );
			expect( plans ).toEqual( {} );
		} );

		it( 'replaces old plans with new plans', () => {
			let state = reducer( undefined, setPlans( [ MOCK_PLAN_FREE ], LOCALE_EN ) );

			state = reducer(
				state,
				setPlanProducts( [
					MOCK_PLAN_PRODUCT_FREE,
					MOCK_PLAN_PRODUCT_PREMIUM_ANNUALLY,
					MOCK_PLAN_PRODUCT_PREMIUM_MONTHLY,
				] )
			);

			const newFreePlan = { ...MOCK_PLAN_FREE, title: 'new free' };

			const { plans } = reducer( state, setPlans( [ newFreePlan ], LOCALE_EN ) );

			expect( plans[ LOCALE_EN ][ 0 ].title ).toBe( newFreePlan.title );
			expect( plans[ LOCALE_EN ][ 1 ] ).toBeUndefined();
		} );
	} );

	describe( 'Features By Type', () => {
		it( 'defaults to no featuresByType info', () => {
			const { featuresByType } = reducer( undefined, { type: 'NOOP' } );
			expect( featuresByType ).toEqual( {} );
		} );

		it( 'replaces old featuresByType info with new featuresByType info', () => {
			const state = reducer(
				undefined,
				setFeaturesByType(
					[ MOCK_FEATURES_BY_TYPE_GENERAL, MOCK_FEATURES_BY_TYPE_COMMERCE ],
					LOCALE_EN
				)
			);

			const { featuresByType } = reducer(
				state,
				setFeaturesByType( [ MOCK_FEATURES_BY_TYPE_MARKETING ], LOCALE_EN )
			);

			expect( featuresByType[ LOCALE_EN ] ).toEqual( [ MOCK_FEATURES_BY_TYPE_MARKETING ] );
		} );
	} );

	describe( 'Features', () => {
		it( 'defaults to no feature info', () => {
			const { features } = reducer( undefined, { type: 'NOOP' } );
			expect( features ).toEqual( {} );
		} );

		it( 'replaces old features with new features', () => {
			const state = reducer(
				undefined,
				setFeatures(
					{
						[ PLAN_FREE ]: MOCK_SIMPLIFIED_FEATURE_CUSTOM_DOMAIN,
						[ PLAN_PREMIUM ]: MOCK_SIMPLIFIED_FEATURE_LIVE_SUPPORT,
					},
					LOCALE_EN
				)
			);

			const { features } = reducer(
				state,
				setFeatures( { [ PLAN_FREE ]: MOCK_SIMPLIFIED_FEATURE_PRIORITY_SUPPORT }, LOCALE_EN )
			);

			expect( features[ LOCALE_EN ][ PLAN_FREE ].name ).toBe(
				MOCK_SIMPLIFIED_FEATURE_PRIORITY_SUPPORT.name
			);
			expect( features[ LOCALE_EN ][ PLAN_PREMIUM ] ).toBeUndefined();
		} );
	} );
} );
