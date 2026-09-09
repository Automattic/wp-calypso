import { planSupportsBuildWow } from '../build-wow-plans';

describe( 'planSupportsBuildWow', () => {
	it.each( [
		'value_bundle',
		'value_bundle_monthly',
		'value_bundle-2y',
		'business-bundle',
		'business-bundle-monthly',
		'business-bundle-3y',
	] )( 'accepts the build-wow-eligible plan %s', ( slug ) => {
		expect( planSupportsBuildWow( slug ) ).toBe( true );
	} );

	it.each( [
		'free_plan',
		'pro-plan',
		'personal-bundle',
		'personal-bundle-monthly',
		'ecommerce-bundle',
		'ecommerce-bundle-monthly',
		'not-a-plan',
	] )( 'rejects %s', ( slug ) => {
		expect( planSupportsBuildWow( slug ) ).toBe( false );
	} );

	it( 'rejects a missing plan', () => {
		expect( planSupportsBuildWow( undefined ) ).toBe( false );
		expect( planSupportsBuildWow( null ) ).toBe( false );
	} );
} );
