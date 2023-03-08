import {
	planHasFeature,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_SOCIAL_ADVANCED_PRODUCTS,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_ANTISPAM,
	WPCOM_FEATURES_SCAN,
} from '@automattic/calypso-products';

const currentSiteProducts = [
	{
		productSlug: 'some_product',
	},
	{
		productSlug: JETPACK_SOCIAL_PRODUCTS[ 0 ],
	},
];

// social products returns multiple different slugs, this test ensures a valid slug can be pulled out of the JETPACK_SOCIAL_PRODUCTS object
describe( 'currentSiteProducts', () => {
	it( 'should find the social product if it is present', () => {
		const socialProduct = currentSiteProducts.find( ( product ) =>
			JETPACK_SOCIAL_PRODUCTS.includes( product.productSlug )
		);
		expect( socialProduct ).toEqual( {
			productSlug: JETPACK_SOCIAL_PRODUCTS[ 0 ],
		} );
	} );

	it( 'should return undefined if the social product is not present', () => {
		const nonSocialProducts = currentSiteProducts.filter(
			( product ) => ! JETPACK_SOCIAL_PRODUCTS.includes( product.productSlug )
		);
		const socialProduct = nonSocialProducts.find( ( product ) =>
			JETPACK_SOCIAL_PRODUCTS.includes( product.productSlug )
		);
		expect( socialProduct ).toBeUndefined();
	} );
} );

//test that the features exist on plans we expect
describe( 'planHasBackupFeature', () => {
	it( 'should return true when plan has backups', () => {
		expect( planHasFeature( 'jetpack_complete', WPCOM_FEATURES_BACKUPS ) ).toBe( true );
		expect( planHasFeature( 'jetpack_security_ti_yearly', WPCOM_FEATURES_BACKUPS ) ).toBe( true );
	} );

	it( 'should return false when plan does not have backups', () => {
		expect( planHasFeature( 'jetpack_free', WPCOM_FEATURES_BACKUPS ) ).toBe( false );
	} );

	it( 'should return true when plan has Social', () => {
		expect( planHasFeature( 'jetpack_complete', JETPACK_SOCIAL_ADVANCED_PRODUCTS[ 0 ] ) ).toBe(
			true
		);
	} );

	it( 'should return false when plan does not have Social', () => {
		expect( planHasFeature( 'jetpack_security_t1_yearly', JETPACK_SOCIAL_PRODUCTS[ 0 ] ) ).toBe(
			false
		);
	} );

	it( 'should return true when plan has Akismet', () => {
		expect( planHasFeature( 'jetpack_complete', WPCOM_FEATURES_ANTISPAM ) ).toBe( true );
		expect( planHasFeature( 'jetpack_security_t1_yearly', WPCOM_FEATURES_ANTISPAM ) ).toBe( true );
	} );

	it( 'should return false when plan does not have Akismet', () => {
		expect( planHasFeature( 'jetpack_free', WPCOM_FEATURES_ANTISPAM ) ).toBe( false );
	} );

	it( 'should return true when plan has Scan', () => {
		expect( planHasFeature( 'jetpack_complete', WPCOM_FEATURES_SCAN ) ).toBe( true );
		expect( planHasFeature( 'jetpack_security_t1_yearly', WPCOM_FEATURES_SCAN ) ).toBe( true );
	} );

	it( 'should return false when plan does not have Scan', () => {
		expect( planHasFeature( 'jetpack_free', WPCOM_FEATURES_SCAN ) ).toBe( false );
	} );
} );
