import { planSupportsBuildWow } from '../build-wow-plans';

describe( 'planSupportsBuildWow', () => {
	it.each( [
		'personal-bundle',
		'personal-bundle-monthly',
		'value_bundle',
		'value_bundle_monthly',
		'value_bundle-2y',
		'business-bundle',
		'business-bundle-monthly',
		'business-bundle-3y',
		'ecommerce-bundle',
		'ecommerce-bundle-monthly',
	] )( 'accepts the Atomic-capable plan %s', ( slug ) => {
		expect( planSupportsBuildWow( slug ) ).toBe( true );
	} );

	it.each( [ 'free_plan', 'pro-plan', 'not-a-plan' ] )( 'rejects %s', ( slug ) => {
		expect( planSupportsBuildWow( slug ) ).toBe( false );
	} );

	it( 'rejects a missing plan', () => {
		expect( planSupportsBuildWow( undefined ) ).toBe( false );
		expect( planSupportsBuildWow( null ) ).toBe( false );
	} );
} );
