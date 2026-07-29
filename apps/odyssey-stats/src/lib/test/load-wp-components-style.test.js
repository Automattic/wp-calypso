/**
 * @jest-environment jsdom
 */
import config from '../config-api';
import { isProvidedByWpAdmin } from '../load-wp-components-style';

jest.mock( '../config-api', () => jest.fn() );

const SITE_ID = 123;

function mockSiteOptions( options ) {
	config.mockImplementation( ( key ) => {
		if ( key === 'blog_id' ) {
			return SITE_ID;
		}
		if ( key === 'intial_state' ) {
			return { sites: { items: { [ SITE_ID ]: { options } } } };
		}
		return undefined;
	} );
}

function mockWpVersion( softwareVersion ) {
	mockSiteOptions( { software_version: softwareVersion } );
}

function mockStatsAdminVersion( statsAdminVersion ) {
	mockSiteOptions( { stats_admin_version: statsAdminVersion } );
}

describe( 'isProvidedByWpAdmin — software_version signal (WP 7.0+ command palette)', () => {
	afterEach( () => {
		config.mockReset();
	} );

	it.each( [ '7.0', '7.0.2', '7.1', '8.0', '10.0' ] )(
		'reports WP %s as already providing the stylesheet, so we skip our copy',
		( version ) => {
			mockWpVersion( version );
			expect( isProvidedByWpAdmin() ).toBe( true );
		}
	);

	it.each( [ '6.9', '6.9.3', '6.8.3', '6.7', '5.9' ] )(
		'reports WP %s as not providing it, so we load our copy',
		( version ) => {
			mockWpVersion( version );
			expect( isProvidedByWpAdmin() ).toBe( false );
		}
	);

	it( 'compares segments numerically, not lexically — 6.10 must not beat 7.0', () => {
		mockWpVersion( '6.10' );
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );

	it( 'treats a two-digit major correctly — 10.0 is above 7.0 despite sorting below as a string', () => {
		mockWpVersion( '10.0' );
		expect( isProvidedByWpAdmin() ).toBe( true );
	} );

	it( 'handles a WP beta/RC version string such as 7.0-beta1', () => {
		mockWpVersion( '7.0-beta1' );
		// `parseInt( '0-beta1' )` is 0, so this reads as 7.0 — correct, betas ship the palette.
		expect( isProvidedByWpAdmin() ).toBe( true );
	} );
} );

describe( 'isProvidedByWpAdmin — stats_admin_version signal (Jetpack declares the dependency)', () => {
	afterEach( () => {
		config.mockReset();
	} );

	it.each( [ '0.32.0', '0.32.1', '0.33.0', '1.0.0' ] )(
		'reports stats-admin %s as already providing the stylesheet, so we skip our copy',
		( version ) => {
			mockStatsAdminVersion( version );
			expect( isProvidedByWpAdmin() ).toBe( true );
		}
	);

	it.each( [ '0.31.11', '0.31.0', '0.9.0', '0.5.2' ] )(
		'reports stats-admin %s as not providing it, so we load our copy',
		( version ) => {
			mockStatsAdminVersion( version );
			expect( isProvidedByWpAdmin() ).toBe( false );
		}
	);

	it( 'compares segments numerically, not lexically — 0.9 must not beat 0.32', () => {
		mockStatsAdminVersion( '0.9.0' );
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );
} );

describe( 'isProvidedByWpAdmin — either signal is sufficient', () => {
	afterEach( () => {
		config.mockReset();
	} );

	it( 'skips our copy when Jetpack has updated but WP has not — the dependency declaration is enough on its own', () => {
		mockSiteOptions( { software_version: '6.9', stats_admin_version: '0.32.0' } );
		expect( isProvidedByWpAdmin() ).toBe( true );
	} );

	it( 'skips our copy when WP is 7.0+ but Jetpack has not updated yet — the global enqueue is enough on its own', () => {
		mockSiteOptions( { software_version: '7.0.2', stats_admin_version: '0.31.11' } );
		expect( isProvidedByWpAdmin() ).toBe( true );
	} );

	it( 'loads our copy only when neither signal holds', () => {
		mockSiteOptions( { software_version: '6.9', stats_admin_version: '0.31.11' } );
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );
} );

describe( 'isProvidedByWpAdmin — malformed or missing data fails safe toward loading our copy', () => {
	afterEach( () => {
		config.mockReset();
	} );

	it.each( [
		[ 'undefined', undefined ],
		[ 'a non-string', 702 ],
		[ 'an unparseable string', 'not-a-version' ],
		[ 'an empty string', '' ],
	] )( 'falls back when software_version is %s', ( _label, version ) => {
		mockWpVersion( version );
		// Failing safe matters: skipping when we shouldn't leaves the app visibly unstyled,
		// whereas loading when we needn't is merely redundant.
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );

	it.each( [
		[ 'undefined', undefined ],
		[ 'a non-string', 320 ],
		[ 'an unparseable string', 'not-a-version' ],
	] )( 'falls back when stats_admin_version is %s', ( _label, version ) => {
		mockStatsAdminVersion( version );
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );

	it( 'falls back to loading our copy when site options are missing entirely', () => {
		config.mockImplementation( ( key ) => ( key === 'blog_id' ? SITE_ID : {} ) );
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );
} );
