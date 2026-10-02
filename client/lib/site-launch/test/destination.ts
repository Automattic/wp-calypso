import { getLaunchCheckoutUrl, getLaunchDestination, getLaunchReturnUrl } from '../destination';

jest.mock( 'calypso/lib/url', () => ( {
	...jest.requireActual( 'calypso/lib/url' ),
	pathToUrl: ( path: string ) => `https://wordpress.com${ path }`,
} ) );

const siteSlug = 'test-site';

describe( 'getLaunchReturnUrl', () => {
	it( 'returns back_to when given', () => {
		expect( getLaunchReturnUrl( { siteSlug, backTo: '/sites/test-site/settings' } ) ).toBe(
			'/sites/test-site/settings'
		);
	} );

	it.each( [ 'wp-admin', 'wp-admin/options-general.php' ] )(
		'returns the site’s wp-admin when ref is %s',
		( ref ) => {
			expect( getLaunchReturnUrl( { siteSlug, ref } ) ).toBe( `https://test-site/${ ref }` );
		}
	);

	it( 'ignores refs that are not wp-admin', () => {
		expect( getLaunchReturnUrl( { siteSlug, ref: 'wp-adminx' } ) ).toBe( '/home/test-site' );
	} );

	it( 'falls back to My Home', () => {
		expect( getLaunchReturnUrl( { siteSlug } ) ).toBe( '/home/test-site' );
	} );

	it( 'returns a back_to on the dashboard', () => {
		expect(
			getLaunchReturnUrl( { siteSlug, backTo: 'https://my.wordpress.com/sites/test-site' } )
		).toBe( 'https://my.wordpress.com/sites/test-site' );
	} );

	it.each( [
		'https://evil.example/',
		'//evil.example/',
		'/\\evil.example/',
		'javascript:alert(1)',
		'https://my.wordpress.com.evil.example/',
	] )( 'ignores the unsafe back_to %s', ( backTo ) => {
		expect( getLaunchReturnUrl( { siteSlug, backTo, ref: 'wp-admin' } ) ).toBe(
			'https://test-site/wp-admin'
		);
	} );
} );

describe( 'getLaunchDestination', () => {
	it( 'celebrates on My Home by default', () => {
		expect( getLaunchDestination( { siteSlug } ) ).toBe( '/home/test-site?celebrateLaunch=true' );
	} );

	it( 'returns the user to back_to', () => {
		expect(
			getLaunchDestination( { siteSlug, backTo: '/sites/test-site/settings/site-visibility' } )
		).toBe( '/sites/test-site/settings/site-visibility?celebrateLaunch=true' );
	} );

	it( 'prefers redirect_to over back_to', () => {
		expect(
			getLaunchDestination( {
				siteSlug,
				backTo: '/sites/test-site/settings/site-visibility',
				redirectTo: '/sites/test-site',
			} )
		).toBe( '/sites/test-site?celebrateLaunch=true' );
	} );

	it.each( [
		'https://evil.example/',
		'//evil.example/',
		'javascript:alert(1)',
		'https://my.wordpress.com.evil.example/',
	] )( 'ignores the unsafe redirect_to %s', ( redirectTo ) => {
		expect( getLaunchDestination( { siteSlug, redirectTo, backTo: '/sites' } ) ).toBe(
			'/sites?celebrateLaunch=true'
		);
	} );

	it( 'lands on a redirect_to on the dashboard', () => {
		expect(
			getLaunchDestination( {
				siteSlug,
				redirectTo: 'https://my.wordpress.com/sites/test-site',
			} )
		).toBe( 'https://my.wordpress.com/sites/test-site?celebrateLaunch=true' );
	} );

	it( 'uses wp-admin’s celebrate argument', () => {
		expect( getLaunchDestination( { siteSlug, ref: 'wp-admin' } ) ).toBe(
			'https://test-site/wp-admin?celebrate-launch=true'
		);
	} );
} );

describe( 'getLaunchCheckoutUrl', () => {
	const parse = ( url: string ) => new URL( url, 'https://wordpress.com' );

	it( 'sends the user to the site’s checkout as a signup', () => {
		const url = parse( getLaunchCheckoutUrl( { siteSlug } ) );

		expect( url.pathname ).toBe( '/checkout/test-site' );
		expect( url.searchParams.get( 'signup' ) ).toBe( '1' );
	} );

	it( 'lands on the launch destination after checkout', () => {
		const url = parse( getLaunchCheckoutUrl( { siteSlug, backTo: '/sites/test-site' } ) );

		expect( url.searchParams.get( 'redirect_to' ) ).toBe( '/sites/test-site?celebrateLaunch=true' );
	} );

	it( 'celebrates the launch when the user leaves checkout', () => {
		const url = parse( getLaunchCheckoutUrl( { siteSlug } ) );

		expect( url.searchParams.get( 'checkoutBackUrl' ) ).toBe(
			'https://wordpress.com/home/test-site?celebrateLaunch=true&skippedCheckout=1'
		);
	} );

	it( 'keeps an absolute destination as the back URL', () => {
		const url = parse( getLaunchCheckoutUrl( { siteSlug, ref: 'wp-admin' } ) );

		expect( url.searchParams.get( 'checkoutBackUrl' ) ).toBe(
			'https://test-site/wp-admin?celebrate-launch=true&skippedCheckout=1&celebrateLaunch=true'
		);
	} );

	it( 'passes through ref, coupon and dashboard', () => {
		const url = parse(
			getLaunchCheckoutUrl( { siteSlug, ref: 'my-home', coupon: 'SAVE', dashboard: 'ciab' } )
		);

		expect( url.searchParams.get( 'ref' ) ).toBe( 'my-home' );
		expect( url.searchParams.get( 'coupon' ) ).toBe( 'SAVE' );
		expect( url.searchParams.get( 'dashboard' ) ).toBe( 'ciab' );
	} );

	it( 'drops a dashboard it does not know', () => {
		const url = parse( getLaunchCheckoutUrl( { siteSlug, dashboard: 'evil' } ) );

		expect( url.searchParams.has( 'dashboard' ) ).toBe( false );
	} );
} );
