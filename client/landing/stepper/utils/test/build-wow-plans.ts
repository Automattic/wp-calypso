import { planMayBuildStoreOnBuildWow, planSupportsBuildWow } from '../build-wow-plans';

describe( 'planSupportsBuildWow', () => {
	it.each( [
		'personal-bundle',
		'personal-bundle-monthly',
		'personal-bundle-2y',
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

describe( 'planMayBuildStoreOnBuildWow', () => {
	it.each( [ 'ecommerce-bundle', 'ecommerce-bundle-monthly', 'ecommerce-bundle-2y' ] )(
		'accepts the Commerce plan %s',
		( slug ) => {
			expect( planMayBuildStoreOnBuildWow( slug ) ).toBe( true );
		}
	);

	it.each( [ 'free_plan', 'personal-bundle', 'value_bundle', 'business-bundle', 'not-a-plan' ] )(
		'rejects %s',
		( slug ) => {
			expect( planMayBuildStoreOnBuildWow( slug ) ).toBe( false );
		}
	);

	it( 'rejects a missing plan', () => {
		expect( planMayBuildStoreOnBuildWow( undefined ) ).toBe( false );
		expect( planMayBuildStoreOnBuildWow( null ) ).toBe( false );
	} );
} );
