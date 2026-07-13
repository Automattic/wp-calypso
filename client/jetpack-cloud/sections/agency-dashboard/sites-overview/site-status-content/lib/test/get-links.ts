/**
 * @jest-environment node
 */
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import getLinks from '../get-links';

jest.mock( 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies' );

const mockedIsA8CForAgencies = isA8CForAgencies as jest.MockedFunction< typeof isA8CForAgencies >;

const SITE_URL = 'example.com';
const SITE_URL_WITH_SCHEME = 'https://example.com';

describe( 'getLinks', () => {
	describe( 'plugin', () => {
		it( 'links a non-Atomic site to plugin management in Jetpack Cloud', () => {
			mockedIsA8CForAgencies.mockReturnValue( false );

			expect( getLinks( 'plugin', 'warning', SITE_URL, SITE_URL_WITH_SCHEME, false ) ).toEqual( {
				link: `/plugins/manage/${ SITE_URL }`,
				isExternalLink: false,
			} );
		} );

		it( 'links a non-Atomic site to wp-admin in A4A, which has no per-site plugins route', () => {
			mockedIsA8CForAgencies.mockReturnValue( true );

			expect( getLinks( 'plugin', 'warning', SITE_URL, SITE_URL_WITH_SCHEME, false ) ).toEqual( {
				link: `${ SITE_URL_WITH_SCHEME }/wp-admin/plugins.php`,
				isExternalLink: true,
			} );
		} );

		it( 'links an Atomic site to wp-admin', () => {
			mockedIsA8CForAgencies.mockReturnValue( false );

			expect( getLinks( 'plugin', 'warning', SITE_URL, SITE_URL_WITH_SCHEME, true ) ).toEqual( {
				link: `${ SITE_URL_WITH_SCHEME }/wp-admin/plugins.php`,
				isExternalLink: true,
			} );
		} );
	} );
} );
