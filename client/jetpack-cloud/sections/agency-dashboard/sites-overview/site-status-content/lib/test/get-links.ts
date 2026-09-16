/**
 * @jest-environment jsdom
 */
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import getLinks from '../get-links';

jest.mock( 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies' );

const SITE_URL = 'example.com';
const SITE_URL_WITH_SCHEME = 'https://example.com';

const getPluginLink = ( status: string, isAtomicSite = false ) =>
	getLinks( 'plugin', status, SITE_URL, SITE_URL_WITH_SCHEME, isAtomicSite );

describe( 'getLinks', () => {
	beforeEach( () => {
		jest.mocked( isA8CForAgencies ).mockReturnValue( false );
	} );

	describe( 'plugin', () => {
		it( 'links a site with pending updates to the site-scoped plugin manager, pre-filtered', () => {
			expect( getPluginLink( 'warning' ) ).toEqual( {
				link: '/plugins/manage/example.com?updates=1',
				isExternalLink: false,
			} );
		} );

		it( 'links a site without pending updates to the site-scoped plugin manager, unfiltered', () => {
			expect( getPluginLink( 'success' ) ).toEqual( {
				link: '/plugins/manage/example.com',
				isExternalLink: false,
			} );
		} );

		it( 'preserves the multisite path when building the site slug', () => {
			const { link } = getLinks(
				'plugin',
				'warning',
				'example.com/subsite',
				'https://example.com/subsite',
				false
			);

			expect( link ).toEqual( '/plugins/manage/example.com::subsite?updates=1' );
		} );

		it( 'links Atomic sites out to wp-admin', () => {
			expect( getPluginLink( 'warning', true ) ).toEqual( {
				link: 'https://example.com/wp-admin/plugins.php',
				isExternalLink: true,
			} );
		} );

		it.each( [ 'warning', 'success' ] )( 'links out to wp-admin in A4A (%s)', ( status ) => {
			jest.mocked( isA8CForAgencies ).mockReturnValue( true );

			expect( getPluginLink( status ) ).toEqual( {
				link: 'https://example.com/wp-admin/plugins.php',
				isExternalLink: true,
			} );
		} );
	} );
} );
