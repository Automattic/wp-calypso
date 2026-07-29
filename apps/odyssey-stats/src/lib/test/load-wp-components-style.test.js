/**
 * @jest-environment jsdom
 */
import config from '../config-api';
import { isProvidedByWpAdmin } from '../load-wp-components-style';

jest.mock( '../config-api', () => jest.fn() );

const SITE_ID = 123;

function mockWpVersion( softwareVersion ) {
	config.mockImplementation( ( key ) => {
		if ( key === 'blog_id' ) {
			return SITE_ID;
		}
		if ( key === 'intial_state' ) {
			return {
				sites: {
					items: {
						[ SITE_ID ]: { options: { software_version: softwareVersion } },
					},
				},
			};
		}
		return undefined;
	} );
}

describe( 'isProvidedByWpAdmin', () => {
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

	it.each( [
		[ 'undefined', undefined ],
		[ 'a non-string', 702 ],
		[ 'an unparseable string', 'not-a-version' ],
		[ 'an empty string', '' ],
	] )( 'falls back to loading our copy when the version is %s', ( _label, version ) => {
		mockWpVersion( version );
		// Failing safe matters: skipping when we shouldn't leaves the app visibly unstyled,
		// whereas loading when we needn't is merely redundant.
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );

	it( 'falls back to loading our copy when site options are missing entirely', () => {
		config.mockImplementation( ( key ) => ( key === 'blog_id' ? SITE_ID : {} ) );
		expect( isProvidedByWpAdmin() ).toBe( false );
	} );

	it( 'handles a WP beta/RC version string such as 7.0-beta1', () => {
		mockWpVersion( '7.0-beta1' );
		// `parseInt( '0-beta1' )` is 0, so this reads as 7.0 — correct, betas ship the palette.
		expect( isProvidedByWpAdmin() ).toBe( true );
	} );
} );
