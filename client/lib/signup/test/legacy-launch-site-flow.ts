import { getLegacyLaunchSiteRedirect } from '../legacy-launch-site-flow';

const target = ( ...args: Parameters< typeof getLegacyLaunchSiteRedirect > ) =>
	new URL( getLegacyLaunchSiteRedirect( ...args ), 'https://wordpress.com' );

describe( 'getLegacyLaunchSiteRedirect', () => {
	it( 'redirects to the Stepper flow', () => {
		expect( getLegacyLaunchSiteRedirect() ).toBe( '/setup/launch-site' );
	} );

	// The flow validates `back_to` and `redirect_to` where it reads them, so nothing is filtered here.
	it( 'carries the query over', () => {
		const url = target( {
			siteSlug: 'example.wordpress.com',
			back_to: '/sites',
			redirect_to: 'https://example.wordpress.com/wp-admin/',
			ref: 'wp-admin',
		} );

		expect( url.pathname ).toBe( '/setup/launch-site' );
		expect( url.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( url.searchParams.get( 'back_to' ) ).toBe( '/sites' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			'https://example.wordpress.com/wp-admin/'
		);
		expect( url.searchParams.get( 'ref' ) ).toBe( 'wp-admin' );
	} );

	it( 'drops empty and repeated arguments', () => {
		const url = target( { siteSlug: 'example.wordpress.com', new: '', source: [ 'a', 'b' ] } );

		expect( url.searchParams.has( 'new' ) ).toBe( false );
		expect( url.searchParams.has( 'source' ) ).toBe( false );
	} );
} );
