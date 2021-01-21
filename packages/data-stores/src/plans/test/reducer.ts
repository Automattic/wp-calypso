/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { setPlans, setFeaturesByType, setFeatures, setPlanProducts } from '../actions';
import { PLAN_FREE, PLAN_PREMIUM } from '../constants';

/*
{
	plans: [
		{
			title: 'free plan',
			description: 'it is free',
			features: [],
			isFree: true,
			isPopular: false,
			periodAgnosticSlug: 'Free',
			productIds: [ 1 ],
		},
		{
			title: 'premium plan',
			description: 'it is premium',
			features: [],
			isPopular: true,
			periodAgnosticSlug: 'Premium',
			productIds: [ 2, 3 ],
		},
	],
	planProducts: [
		{
			productId: 1,
			price: '0',
			rawPrice: 0,
			billingPeriod: 'ANNUALLY',
			pathSlug: 'free',
			annualDiscount: 0,
			storeSlug: 'free_plan',
			periodAgnosticSlug: 'Free',
		},
		{
			productId: 2,
			price: '0',
			rawPrice: 0,
			billingPeriod: 'MONTHLY',
			pathSlug: 'premium',
			annualDiscount: 0,
			storeSlug: 'value_bundle_monthly',
			periodAgnosticSlug: 'Premium',
		},
		{
			productId: 3,
			price: '0',
			rawPrice: 0,
			billingPeriod: 'ANNUALLY',
			pathSlug: 'premium',
			annualDiscount: 0,
			storeSlug: 'value_bundle',
			periodAgnosticSlug: 'Premium',
		},
	],
	features: {},
	featuresByType: [],
}
*/

describe( 'Plans reducer', () => {
	describe( 'Plans', () => {
		it( 'defaults to no plans info', () => {
			const { plans } = reducer( undefined, { type: 'DUMMY' } );
			expect( plans ).toEqual( [] );
		} );

		it( 'replaces old plans with new plans', () => {
			let state = reducer(
				undefined,
				setPlans( [
					{
						title: 'free plan',
						description: 'it is free',
						features: [],
						isFree: true,
						isPopular: false,
						periodAgnosticSlug: 'Free',
						productIds: [ 1 ],
					},
				] )
			);

			state = reducer(
				state,
				setPlanProducts( [
					{
						productId: 1,
						price: '0',
						rawPrice: 0,
						billingPeriod: 'ANNUALLY',
						pathSlug: 'free',
						annualDiscount: 0,
						storeSlug: 'free_plan',
						periodAgnosticSlug: 'Free',
					},
					{
						productId: 2,
						price: '0',
						rawPrice: 0,
						billingPeriod: 'MONTHLY',
						pathSlug: 'premium',
						annualDiscount: 0,
						storeSlug: 'value_bundle_monthly',
						periodAgnosticSlug: 'Premium',
					},
					{
						productId: 3,
						price: '0',
						rawPrice: 0,
						billingPeriod: 'ANNUALLY',
						pathSlug: 'premium',
						annualDiscount: 0,
						storeSlug: 'value_bundle',
						periodAgnosticSlug: 'Premium',
					},
				] )
			);

			const { plans } = reducer(
				state,
				setPlans( [
					{
						title: 'new free',
						description: 'it is free',
						features: [],
						isPopular: true,
						periodAgnosticSlug: 'Free',
						productIds: [ 1 ],
					},
				] )
			);

			expect( plans[ 0 ].title ).toBe( 'new free' );
			expect( plans[ 1 ] ).toBeUndefined();
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
