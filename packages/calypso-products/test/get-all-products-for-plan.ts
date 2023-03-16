import { getAllProductsForPlan } from '../src';

describe( 'getAllProductsForPlan', () => {
	test( 'returns an empty array when given an invalid plan', () => {
		const result = getAllProductsForPlan( 'invalid-plan' );
		expect( result ).toEqual( [] );
	} );

	test( 'returns an empty array for Jetpack free', () => {
		const plan = 'jetpack_free';
		const result = getAllProductsForPlan( plan );
		expect( result ).toEqual( [] );
	} );
	test( 'Checks for products that should exist in "jetpack_complete" plan', () => {
		const plan = 'jetpack_complete';
		const result = getAllProductsForPlan( plan );
		expect( result ).toContain( `jetpack_boost_yearly` );
		expect( result ).toContain( `jetpack_social_advanced_yearly` );
	} );
} );
