import {
	PLUGIN_REGISTRY,
	getLogoForFamilies,
	getPluginDisplayName,
	getPluginEntry,
} from '../plugin-registry';

describe( 'PLUGIN_REGISTRY', () => {
	test( 'every entry agrees with its key on slug', () => {
		for ( const [ slug, entry ] of Object.entries( PLUGIN_REGISTRY ) ) {
			expect( entry.slug ).toBe( slug );
		}
	} );

	test( 'isFullJetpack is set only on the full Jetpack entry', () => {
		expect( PLUGIN_REGISTRY.jetpack.isFullJetpack ).toBe( true );
		for ( const [ slug, entry ] of Object.entries( PLUGIN_REGISTRY ) ) {
			if ( slug === 'jetpack' ) {
				continue;
			}
			expect( entry.isFullJetpack ).toBeFalsy();
		}
	} );

	test( 'covers the ten plugins enumerated in the unified-connection spec', () => {
		const expected = [
			'jetpack',
			'jetpack-backup',
			'jetpack-protect',
			'jetpack-boost',
			'jetpack-search',
			'jetpack-social',
			'jetpack-videopress',
			'woocommerce',
			'woocommerce-payments',
			'automattic-for-agencies-client',
		];
		for ( const slug of expected ) {
			expect( PLUGIN_REGISTRY[ slug ] ).toBeDefined();
		}
	} );
} );

describe( 'getPluginEntry', () => {
	test( 'returns the entry for known slugs', () => {
		expect( getPluginEntry( 'jetpack' )?.family ).toBe( 'jetpack' );
		expect( getPluginEntry( 'woocommerce' )?.family ).toBe( 'woo' );
		expect( getPluginEntry( 'automattic-for-agencies-client' )?.family ).toBe( 'a4a' );
	} );

	test( 'returns undefined for unknown slugs', () => {
		expect( getPluginEntry( 'unknown-plugin' ) ).toBeUndefined();
		expect( getPluginEntry( 'jetpack-search-extra' ) ).toBeUndefined();
		expect( getPluginEntry( '' ) ).toBeUndefined();
	} );
} );

describe( 'getPluginDisplayName', () => {
	test( 'returns the registered display name for known slugs', () => {
		expect( getPluginDisplayName( 'jetpack' ) ).toBe( 'Jetpack' );
		expect( getPluginDisplayName( 'jetpack-backup' ) ).toBe( 'Jetpack VaultPress Backup' );
		expect( getPluginDisplayName( 'woocommerce-payments' ) ).toBe( 'WooPayments' );
		expect( getPluginDisplayName( 'automattic-for-agencies-client' ) ).toBe(
			'Automattic for Agencies'
		);
	} );

	test( 'falls back to the raw slug for unknown plugins', () => {
		expect( getPluginDisplayName( 'unknown-plugin' ) ).toBe( 'unknown-plugin' );
		expect( getPluginDisplayName( 'jetpack-search-extra' ) ).toBe( 'jetpack-search-extra' );
		expect( getPluginDisplayName( '' ) ).toBe( '' );
	} );
} );

describe( 'getLogoForFamilies', () => {
	test( 'returns the default Jetpack logo when no families are present', () => {
		expect( getLogoForFamilies( [] ) ).toMatch( /jetpack-connect\.svg$/ );
	} );

	test( 'returns the default Jetpack logo for jetpack-only and other-only sets', () => {
		expect( getLogoForFamilies( [ 'jetpack' ] ) ).toMatch( /jetpack-connect\.svg$/ );
		expect( getLogoForFamilies( [ 'jetpack', 'other' ] ) ).toMatch( /jetpack-connect\.svg$/ );
		expect( getLogoForFamilies( [ 'other' ] ) ).toMatch( /jetpack-connect\.svg$/ );
	} );

	test( 'returns the Woo composite when only Woo is present', () => {
		expect( getLogoForFamilies( [ 'woo' ] ) ).toMatch( /jetpack-connect-woo\.svg$/ );
		expect( getLogoForFamilies( [ 'woo', 'jetpack' ] ) ).toMatch( /jetpack-connect-woo\.svg$/ );
	} );

	test( 'returns the A8C composite when only A4A is present', () => {
		expect( getLogoForFamilies( [ 'a4a' ] ) ).toMatch( /jetpack-connect-a8c\.svg$/ );
		expect( getLogoForFamilies( [ 'a4a', 'jetpack' ] ) ).toMatch( /jetpack-connect-a8c\.svg$/ );
	} );

	test( 'returns the all-families composite when both Woo and A4A are present', () => {
		expect( getLogoForFamilies( [ 'woo', 'a4a' ] ) ).toMatch( /jetpack-connect-all\.svg$/ );
		expect( getLogoForFamilies( [ 'a4a', 'woo', 'jetpack' ] ) ).toMatch(
			/jetpack-connect-all\.svg$/
		);
	} );
} );
