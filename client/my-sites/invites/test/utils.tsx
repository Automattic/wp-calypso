import { getRedirectAfterAccept } from '../utils';

jest.mock( 'calypso/lib/logmein', () => ( {
	logmeinUrl: ( _host: string, backUrl: string ) => backUrl,
} ) );

jest.mock( 'calypso/dashboard/utils/link', () => ( {
	dashboardLink: ( path: string ) => `/dashboard${ path }`,
} ) );

function createInvite( overrides = {} ) {
	return {
		site: {
			URL: 'https://example.com',
			title: 'Test Site',
			is_wpforteams_site: false,
			ID: '123',
			domain: 'example.com',
			admin_url: 'https://example.com/wp-admin/',
			is_vip: false,
			...( overrides as Record< string, unknown > ),
		},
		role: 'administrator',
		...overrides,
	};
}

describe( 'getRedirectAfterAccept', () => {
	describe( 'garden sites', () => {
		it( 'redirects to admin_url for garden site with administrator role', () => {
			const invite = createInvite( {
				site: {
					...createInvite().site,
					is_garden_site: true,
				},
			} );

			expect( getRedirectAfterAccept( invite, false ) ).toBe( 'https://example.com/wp-admin/' );
		} );

		it( 'redirects to admin_url for garden site with shop_manager role', () => {
			const invite = createInvite( {
				role: 'shop_manager',
				site: {
					...createInvite().site,
					is_garden_site: true,
				},
			} );

			expect( getRedirectAfterAccept( invite, false ) ).toBe( 'https://example.com/wp-admin/' );
		} );

		it( 'redirects to site URL for garden site with viewer role', () => {
			const invite = createInvite( {
				role: 'viewer',
				site: {
					...createInvite().site,
					is_garden_site: true,
				},
			} );

			expect( getRedirectAfterAccept( invite, false ) ).toBe( 'https://example.com' );
		} );

		it( 'redirects to site URL for garden site with follower role', () => {
			const invite = createInvite( {
				role: 'follower',
				site: {
					...createInvite().site,
					is_garden_site: true,
				},
			} );

			expect( getRedirectAfterAccept( invite, false ) ).toBe( 'https://example.com' );
		} );

		it( 'does not treat is_garden_site=false as a garden site', () => {
			const invite = createInvite( {
				site: {
					...createInvite().site,
					is_garden_site: false,
				},
			} );

			const result = getRedirectAfterAccept( invite, false );
			expect( result ).not.toBe( 'https://example.com/wp-admin/' );
		} );
	} );

	describe( 'non-garden, non-vip sites', () => {
		it( 'redirects to /sites for administrator without garden', () => {
			const invite = createInvite();

			expect( getRedirectAfterAccept( invite, false ) ).toBe( 'https://wordpress.com/sites' );
		} );

		it( 'redirects to /reader for viewer without garden', () => {
			const invite = createInvite( { role: 'viewer' } );

			expect( getRedirectAfterAccept( invite, false ) ).toBe( 'https://wordpress.com/reader' );
		} );
	} );
} );
