/**
 * @jest-environment node
 */
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import getLinks from '../get-links';

jest.mock( 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies' );

const mockedIsA8CForAgencies = isA8CForAgencies as jest.MockedFunction< typeof isA8CForAgencies >;

const SITE_URL = 'test.wordpress.com';
const SITE_URL_WITH_SCHEME = 'https://test.wordpress.com';

const getPluginLink = ( status: string, isAtomicSite = false ) =>
	getLinks( 'plugin', status, SITE_URL, SITE_URL_WITH_SCHEME, isAtomicSite );

describe( 'getLinks', () => {
	describe( 'plugin, in A4A', () => {
		beforeEach( () => {
			mockedIsA8CForAgencies.mockReturnValue( true );
		} );

		it( 'links to wp-admin when updates are available', () => {
			expect( getPluginLink( 'warning' ) ).toEqual( {
				link: `${ SITE_URL_WITH_SCHEME }/wp-admin/plugins.php`,
				isExternalLink: true,
			} );
		} );

		it( 'links to wp-admin when plugins are up to date', () => {
			expect( getPluginLink( 'success' ) ).toEqual( {
				link: `${ SITE_URL_WITH_SCHEME }/wp-admin/plugins.php`,
				isExternalLink: true,
			} );
		} );

		it( 'links to wp-admin for Atomic sites', () => {
			expect( getPluginLink( 'warning', true ) ).toEqual( {
				link: `${ SITE_URL_WITH_SCHEME }/wp-admin/plugins.php`,
				isExternalLink: true,
			} );
		} );
	} );

	describe( 'plugin, in Jetpack Manage', () => {
		beforeEach( () => {
			mockedIsA8CForAgencies.mockReturnValue( false );
		} );

		it( 'links to the plugin dashboard filtered by updates when updates are available', () => {
			expect( getPluginLink( 'warning' ) ).toEqual( {
				link: `/plugins/manage/${ SITE_URL }?updates=1`,
				isExternalLink: false,
			} );
		} );

		it( 'links to the unfiltered plugin dashboard when plugins are up to date', () => {
			expect( getPluginLink( 'success' ) ).toEqual( {
				link: `/plugins/manage/${ SITE_URL }`,
				isExternalLink: false,
			} );
		} );

		it( 'links Atomic sites to the plugin dashboard too', () => {
			expect( getPluginLink( 'warning', true ) ).toEqual( {
				link: `/plugins/manage/${ SITE_URL }?updates=1`,
				isExternalLink: false,
			} );
		} );
	} );
} );
