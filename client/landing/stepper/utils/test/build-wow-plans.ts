import { planSupportsBuildWow, planSupportsBuildWowDsl } from '../build-wow-plans';

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

describe( 'planSupportsBuildWowDsl', () => {
	it.each( [
		'personal-bundle',
		'personal-bundle-monthly',
		'value_bundle',
		'value_bundle_monthly',
		'business-bundle',
		'business-bundle-monthly',
	] )( 'accepts %s', ( slug ) => {
		expect( planSupportsBuildWowDsl( slug ) ).toBe( true );
	} );

	it.each( [ 'free_plan', 'pro-plan', 'ecommerce-bundle', 'not-a-plan' ] )(
		'rejects %s',
		( slug ) => {
			expect( planSupportsBuildWowDsl( slug ) ).toBe( false );
		}
	);

	it( 'rejects a missing plan', () => {
		expect( planSupportsBuildWowDsl( undefined ) ).toBe( false );
		expect( planSupportsBuildWowDsl( null ) ).toBe( false );
	} );
} );
