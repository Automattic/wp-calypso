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
		expect( result ).toContain( `jetpack_backup_t2_yearly` );
		expect( result ).toContain( `jetpack_scan` );
		expect( result ).toContain( `jetpack_anti_spam` );
		expect( result ).toContain( `jetpack_videopress` );
		expect( result ).toContain( `jetpack_boost_yearly` );
		expect( result ).toContain( `jetpack_social_advanced_yearly` );
		expect( result ).toContain( `jetpack_search` );
		expect( result ).toContain( `jetpack_crm` );
	} );
	test( 'checks for products included in "jetpack_security plan', () => {
		const plan = 'jetpack_security_t1_yearly';
		const result = getAllProductsForPlan( plan );
		expect( result ).toContain( `jetpack_backup_t1_yearly` );
		expect( result ).toContain( `jetpack_scan` );
		expect( result ).toContain( `jetpack_anti_spam` );
	} );
} );
