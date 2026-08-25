/**
 * @jest-environment jsdom
 */
import config, { optionalConfig } from '../config-api';
import getWpAdminUrl from '../selectors/get-wp-admin-url';

jest.mock( '../config-api', () => ( {
	__esModule: true,
	default: jest.fn(),
	optionalConfig: jest.fn(),
} ) );

/**
 * @param {string} [adminUrl]  Top-level `admin_url`, absent on a Jetpack that predates the key.
 * @param {string} [statsUrl]  `odyssey_stats_base_url`, always served.
 */
function mockConfig( adminUrl, statsUrl = 'https://example.com/wp-admin/admin.php?page=stats' ) {
	config.mockImplementation( ( key ) =>
		key === 'odyssey_stats_base_url' ? statsUrl : undefined
	);
	optionalConfig.mockImplementation( ( key ) => ( key === 'admin_url' ? adminUrl : undefined ) );
}

afterEach( () => {
	config.mockReset();
	optionalConfig.mockReset();
} );

describe( 'getWpAdminUrl', () => {
	it( 'uses the address the site reports', () => {
		mockConfig( 'https://example.com/wordpress/wp-admin/' );

		expect( getWpAdminUrl() ).toBe( 'https://example.com/wordpress/wp-admin/' );
	} );

	it( 'falls back to the directory holding the Stats page', () => {
		// A `stats-admin` released before `admin_url` was hoisted still has to produce a usable
		// checkout return address.
		mockConfig( undefined );

		expect( getWpAdminUrl() ).toBe( 'https://example.com/wp-admin/' );
	} );

	it( 'follows the Stats page into a non-default admin directory', () => {
		mockConfig( undefined, 'https://example.com/wordpress/wp-admin/admin.php?page=stats' );

		expect( getWpAdminUrl() ).toBe( 'https://example.com/wordpress/wp-admin/' );
	} );

	it( 'reports nothing rather than throwing when neither key is served', () => {
		mockConfig( undefined, '' );

		expect( getWpAdminUrl() ).toBe( '' );
	} );
} );
