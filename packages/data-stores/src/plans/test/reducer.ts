/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { setPlans, setFeaturesByType, setFeatures, setPlanProducts } from '../actions';
import * as MockData from '../mock';
import { buildPlanFeaturesDict } from '../test-utils';

const MOCK_LOCALE = 'test-locale';

describe( 'Plans reducer', () => {
	describe( 'plans', () => {
		it( 'should default to no plans info', () => {
			const { plans } = reducer( undefined, { type: 'NOOP' } );
			expect( plans ).toEqual( {} );
		} );

		it( 'should replace old plans with new plans', () => {
			let state = reducer( undefined, setPlans( [ MockData.STORE_PLAN_FREE ], MOCK_LOCALE ) );

			state = reducer(
				state,
				setPlanProducts( [
					MockData.STORE_PRODUCT_FREE,
					MockData.STORE_PRODUCT_PREMIUM_ANNUALLY,
					MockData.STORE_PRODUCT_PREMIUM_MONTHLY,
				] )
			);

			const newFreePlan = { ...MockData.STORE_PLAN_FREE, title: 'new free' };

			const { plans } = reducer( state, setPlans( [ newFreePlan ], MOCK_LOCALE ) );

			expect( plans[ MOCK_LOCALE ][ 0 ].title ).toBe( newFreePlan.title );
			expect( plans[ MOCK_LOCALE ][ 1 ] ).toBeUndefined();
		} );
	} );

	describe( 'featuresByType', () => {
		it( 'should default to no featuresByType info', () => {
			const { featuresByType } = reducer( undefined, { type: 'NOOP' } );
			expect( featuresByType ).toEqual( {} );
		} );

		it( 'should replace old featuresByType info with new featuresByType info', () => {
			const state = reducer(
				undefined,
				setFeaturesByType(
					[ MockData.API_FEATURES_BY_TYPE_GENERAL, MockData.API_FEATURES_BY_TYPE_COMMERCE ],
					MOCK_LOCALE
				)
			);

			const { featuresByType } = reducer(
				state,
				setFeaturesByType( [ MockData.API_FEATURES_BY_TYPE_MARKETING ], MOCK_LOCALE )
			);

			expect( featuresByType[ MOCK_LOCALE ] ).toEqual( [
				MockData.API_FEATURES_BY_TYPE_MARKETING,
			] );
		} );
	} );

	describe( 'features', () => {
		it( 'should default to no feature info', () => {
			const { features } = reducer( undefined, { type: 'NOOP' } );
			expect( features ).toEqual( {} );
		} );

		it( 'should replace old features with new features', () => {
			const state = reducer(
				undefined,
				setFeatures(
					buildPlanFeaturesDict( [
						MockData.STORE_PLAN_FEATURE_CUSTOM_DOMAIN,
						MockData.STORE_PLAN_FEATURE_LIVE_SUPPORT,
					] ),
					MOCK_LOCALE
				)
			);

			const { features } = reducer(
				state,
				setFeatures(
					buildPlanFeaturesDict( [ MockData.STORE_PLAN_FEATURE_PRIORITY_SUPPORT ] ),
					MOCK_LOCALE
				)
			);

			expect(
				features[ MOCK_LOCALE ][ MockData.STORE_PLAN_FEATURE_PRIORITY_SUPPORT.id ].name
			).toBe( MockData.STORE_SIMPLIFIED_FEATURE_PRIORITY_SUPPORT.name );
			expect(
				features[ MOCK_LOCALE ][ MockData.STORE_PLAN_FEATURE_CUSTOM_DOMAIN.id ]
			).toBeUndefined();
		} );
	} );
} );
