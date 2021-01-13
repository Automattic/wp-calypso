/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { setPlans, setFeaturesByType, setFeatures } from '../actions';
import { PLAN_FREE, PLAN_PREMIUM } from '../constants';

describe( 'Plans reducer', () => {
	describe( 'Plans', () => {
		it( 'defaults to no plans info', () => {
			const { plans } = reducer( undefined, { type: 'DUMMY' } );
			expect( plans ).toEqual( {} );
		} );

		it( 'replaces old plans with new plans', () => {
			const state = reducer(
				undefined,
				setPlans( {
					[ PLAN_FREE ]: {
						title: 'free',
						description: 'description',
						productId: 1,
						storeSlug: PLAN_FREE,
						pathSlug: 'free',
						features: [],
						price: '0',
						rawPrice: 0,
					},
					[ PLAN_PREMIUM ]: {
						title: 'premium',
						description: 'description',
						productId: 1,
						storeSlug: PLAN_PREMIUM,
						pathSlug: 'premium',
						features: [],
						price: '1',
						rawPrice: 1,
					},
				} )
			);
			const { plans } = reducer(
				state,
				setPlans( {
					[ PLAN_FREE ]: {
						title: 'new free',
						description: 'description',
						productId: 1,
						storeSlug: PLAN_FREE,
						pathSlug: 'free',
						features: [],
						price: '0',
						rawPrice: 0,
					},
				} )
			);

			expect( plans[ PLAN_FREE ].title ).toBe( 'new free' );
			expect( plans[ PLAN_PREMIUM ] ).toBeUndefined();
		} );
	} );

	describe( 'Features By Type', () => {
		it( 'defaults to no featuresByType info', () => {
			const { featuresByType } = reducer( undefined, { type: 'DUMMY' } );
			expect( featuresByType ).toEqual( [] );
		} );

		it( 'replaces old featuresByType info with new featuresByType info', () => {
			const state = reducer(
				undefined,
				setFeaturesByType( [
					{
						id: '1',
						name: 'one',
						features: [],
					},
					{
						id: '2',
						name: 'two',
						features: [],
					},
				] )
			);

			const { featuresByType } = reducer(
				state,
				setFeaturesByType( [
					{
						id: '3',
						name: 'three',
						features: [],
					},
				] )
			);

			expect( featuresByType ).toEqual( [
				{
					id: '3',
					name: 'three',
					features: [],
				},
			] );
		} );
	} );

	describe( 'Features', () => {
		it( 'defaults to no feature info', () => {
			const { features } = reducer( undefined, { type: 'DUMMY' } );
			expect( features ).toEqual( {} );
		} );

		it( 'replaces old features with new features', () => {
			const state = reducer(
				undefined,
				setFeatures( { [ PLAN_FREE ]: { name: 'name' }, [ PLAN_PREMIUM ]: { name: 'name' } } )
			);

			const { features } = reducer( state, setFeatures( { [ PLAN_FREE ]: { name: 'new name' } } ) );

			expect( features[ PLAN_FREE ].name ).toBe( 'new name' );
			expect( features[ PLAN_PREMIUM ] ).toBeUndefined();
		} );
	} );
} );
