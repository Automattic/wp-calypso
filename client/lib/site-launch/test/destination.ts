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

	it( 'returns a relative back_to as the path it resolves to', () => {
		expect( getLaunchReturnUrl( { siteSlug, backTo: '/sites/../home/test-site?tab=1' } ) ).toBe(
			'/home/test-site?tab=1'
		);
	} );

	it( 'returns a back_to on the dashboard', () => {
		expect(
			getLaunchReturnUrl( { siteSlug, backTo: 'https://my.wordpress.com/sites/test-site' } )
		).toBe( 'https://my.wordpress.com/sites/test-site' );
	} );

	it( 'returns a back_to on the site being launched', () => {
		expect(
			getLaunchReturnUrl( {
				siteSlug,
				siteUrl: 'https://test-site',
				backTo: 'https://test-site/wp-admin/post.php?post=1&action=edit',
			} )
		).toBe( 'https://test-site/wp-admin/post.php?post=1&action=edit' );
	} );

	it.each( [ 'https://test-site.evil.example/wp-admin/', 'http://test-site/wp-admin/' ] )(
		'ignores %s, which is not on the site being launched',
		( backTo ) => {
			expect( getLaunchReturnUrl( { siteSlug, siteUrl: 'https://test-site', backTo } ) ).toBe(
				'/home/test-site'
			);
		}
	);

	it( 'ignores a site-host back_to when the site is unknown', () => {
		expect( getLaunchReturnUrl( { siteSlug, backTo: 'https://test-site/wp-admin/' } ) ).toBe(
			'/home/test-site'
		);
	} );

	it.each( [
		'https://evil.example/',
		'//evil.example/',
		'/..//evil.example/',
		'/./..//evil.example/',
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
		'/..//evil.example/',
		'/./..//evil.example/',
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

	it( 'lands on the wp-admin screen ref names, not on back_to', () => {
		expect(
			getLaunchDestination( {
				siteSlug,
				siteUrl: 'https://test-site',
				ref: 'wp-admin/options-reading.php',
				backTo: 'https://test-site/wp-admin/post.php?post=1',
			} )
		).toBe( 'https://test-site/wp-admin/options-reading.php?celebrate-launch=true' );
	} );

	it( 'uses wp-admin’s celebrate argument for a wp-admin back_to', () => {
		expect(
			getLaunchDestination( {
				siteSlug,
				siteUrl: 'https://test-site',
				backTo: 'https://test-site/wp-admin/tools.php',
			} )
		).toBe( 'https://test-site/wp-admin/tools.php?celebrate-launch=true' );
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

	it( 'lands on a given destination after paying, but returns to the launch one on leaving', () => {
		const setupUrl = 'https://my.wordpress.com/domains/a.com/domain-connection-setup';
		const url = parse( getLaunchCheckoutUrl( { siteSlug }, setupUrl ) );

		expect( url.searchParams.get( 'redirect_to' ) ).toBe( setupUrl );
		expect( url.searchParams.get( 'checkoutBackUrl' ) ).toBe(
			'https://wordpress.com/home/test-site?celebrateLaunch=true&skippedCheckout=1'
		);
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
			getLaunchCheckoutUrl( { siteSlug, ref: 'my-home', coupon: 'SAVE', dashboard: 'a4a' } )
		);

		expect( url.searchParams.get( 'ref' ) ).toBe( 'my-home' );
		expect( url.searchParams.get( 'coupon' ) ).toBe( 'SAVE' );
		expect( url.searchParams.get( 'dashboard' ) ).toBe( 'a4a' );
	} );

	it( 'drops a dashboard it does not know', () => {
		const url = parse( getLaunchCheckoutUrl( { siteSlug, dashboard: 'evil' } ) );

		expect( url.searchParams.has( 'dashboard' ) ).toBe( false );
	} );
} );
