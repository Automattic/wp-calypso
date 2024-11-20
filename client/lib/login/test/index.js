import { pathWithLeadingSlash, getSignupUrl, getPluginTitle } from 'calypso/lib/login';

describe( 'pathWithLeadingSlash', () => {
	test( 'should add leading slash', () => {
		expect( pathWithLeadingSlash( 'foo' ) ).toEqual( '/foo' );
	} );

	test( 'should return path with a single leading slash', () => {
		expect( pathWithLeadingSlash( '///foo' ) ).toEqual( '/foo' );
	} );

	test( 'should return empty string if path is empty string', () => {
		expect( pathWithLeadingSlash( '' ) ).toEqual( '' );
	} );

	test( 'should return empty string for anything else', () => {
		const values = [ undefined, null, 123, 123n, true, false, Symbol(), {}, function () {} ];
		for ( const i in values ) {
			expect( pathWithLeadingSlash( values[ i ] ) ).toEqual( '' );
		}
	} );
} );

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: jest.fn( ( key ) => {
		switch ( key ) {
			case 'signup_url':
				return '/start';
			case 'i18n_default_locale_slug':
				return 'en';
			default:
				return null;
		}
	} ),
} ) );

describe( 'getSignupUrl', () => {
	test( 'should work for /log-in route', () => {
		const currentRoute = '/log-in';
		expect( getSignupUrl( undefined, currentRoute, null, 'en', '' ) ).toEqual( '/start' );
	} );

	test( 'should localize the /log-in route', () => {
		const currentRoute = '/log-in';
		expect( getSignupUrl( undefined, currentRoute, null, 'de', '' ) ).toEqual( '/start/de' );
	} );

	test( 'should work for /log-in route with redirect_to', () => {
		const currentQuery = {
			redirect_to: '/me/',
		};
		const currentRoute = '/log-in';
		expect( getSignupUrl( currentQuery, currentRoute, null, 'en', '' ) ).toEqual(
			'/start/account?redirect_to=%2Fme%2F'
		);
	} );

	test( 'should work for VaultPress route', () => {
		const currentQuery = {
			client_id: '930',
			redirect_to:
				'https://public-api.wordpress.com/oauth2/authorize?client_id=930&response_type=code&blog_id=0&state=1234&redirect_uri=https%3A%2F%2Fvaultpress.com%2Flogin%2F%3Faction%3Drequest_access_token&from-calypso=1',
		};
		const currentRoute = '/log-in';
		const oauth2Client = {
			id: 930,
			name: 'vaultpress',
			title: 'VaultPress',
			icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
			url: 'http://vaultpress.com/',
		};
		expect( getSignupUrl( currentQuery, currentRoute, oauth2Client, 'en', '' ) ).toEqual(
			'/start/wpcc?oauth2_client_id=930&oauth2_redirect=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%3Fclient_id%3D930%26response_type%3Dcode%26blog_id%3D0%26state%3D1234%26redirect_uri%3Dhttps%253A%252F%252Fvaultpress.com%252Flogin%252F%253Faction%253Drequest_access_token%26from-calypso%3D1'
		);
	} );

	test( 'should work for IntenseDebate route', () => {
		const currentQuery = {
			client_id: '2665',
			redirect_to:
				'https://public-api.wordpress.com/oauth2/authorize?client_id=2665&response_type=code&blog_id=0&state=1234&redirect_uri=https%3A%2F%2Fintensedebate.com%2Fconnect%2F%3Faction%3Drequest_access_token&from-calypso=1',
		};
		const currentRoute = '/log-in';
		const oauth2Client = {
			id: 2665,
			name: 'intensedebate',
			title: 'IntenseDebate',
			icon: 'https://intensedebate.com/images/svg/intensedebate-logo.svg',
			url: 'https://intensedebate.com/',
		};
		expect( getSignupUrl( currentQuery, currentRoute, oauth2Client, 'en', '' ) ).toEqual(
			'/start/wpcc?oauth2_client_id=2665&oauth2_redirect=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%3Fclient_id%3D2665%26response_type%3Dcode%26blog_id%3D0%26state%3D1234%26redirect_uri%3Dhttps%253A%252F%252Fintensedebate.com%252Fconnect%252F%253Faction%253Drequest_access_token%26from-calypso%3D1'
		);
	} );

	test( 'should work for Gravatar route', () => {
		const currentQuery = {
			redirect_to:
				'https://public-api.wordpress.com/oauth2/authorize?client_id=1854&response_type=code&blog_id=0&state=1234&redirect_uri=https%3A%2F%2Fgravatar.com%2Fconnect%2F%3Faction%3Drequest_access_token&from-calypso=1',
			client_id: '1854',
		};
		const currentRoute = '/log-in';
		const oauth2Client = {
			id: 1854,
			name: 'gravatar',
			title: 'Gravatar',
			icon: 'https://gravatar.com/images/grav-logo-blue.svg',
			favicon: 'https://gravatar.com/favicon.ico',
			url: 'https://gravatar.com/',
		};
		expect( getSignupUrl( currentQuery, currentRoute, oauth2Client, 'en', '' ) ).toEqual(
			'/log-in/link?redirect_to=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%3Fclient_id%3D1854%26response_type%3Dcode%26blog_id%3D0%26state%3D1234%26redirect_uri%3Dhttps%253A%252F%252Fgravatar.com%252Fconnect%252F%253Faction%253Drequest_access_token%26from-calypso%3D1&client_id=1854&gravatar_from=signup'
		);
	} );

	test( 'should work for WooCommmerce route', () => {
		const currentQuery = {
			client_id: '50916',
			redirect_to:
				'https://public-api.wordpress.com/oauth2/authorize/?response_type=code&client_id=50916&state=1234&redirect_uri=https%3A%2F%2Fwoocommerce.com%2Fwc-api%2Fwpcom-signin%3Fnext%3D%252F&blog_id=0&wpcom_connect=1&wccom-from&calypso_env=production&from-calypso=1',
		};
		const currentRoute = '/log-in';
		const oauth2Client = {
			id: 50916,
			name: 'woo',
			title: 'WooCommerce.com',
			icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
			url: 'https://woocommerce.com',
		};
		expect( getSignupUrl( currentQuery, currentRoute, oauth2Client, 'en', '' ) ).toEqual(
			'/start/wpcc?oauth2_client_id=50916&oauth2_redirect=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%2F%3Fresponse_type%3Dcode%26client_id%3D50916%26state%3D1234%26redirect_uri%3Dhttps%253A%252F%252Fwoocommerce.com%252Fwc-api%252Fwpcom-signin%253Fnext%253D%25252F%26blog_id%3D0%26wpcom_connect%3D1%26wccom-from%26calypso_env%3Dproduction%26from-calypso%3D1'
		);
	} );

	test( 'should work for Jetpack Cloud route', () => {
		const currentQuery = {
			client_id: '69040',
			redirect_to:
				'https://public-api.wordpress.com/oauth2/authorize?response_type=token&client_id=69040&redirect_uri=https%3A%2F%2Fcloud.jetpack.com%2Fconnect%2Foauth%2Ftoken%3Fnext%3D%252Fpricing&scope=global&blog_id=0&from-calypso=1',
		};
		const currentRoute = '/log-in';
		const oauth2Client = {
			id: 69040,
			name: 'jetpack-cloud',
			title: 'Jetpack.com Staging',
			url: 'https://jetpack.com',
		};
		expect( getSignupUrl( currentQuery, currentRoute, oauth2Client, 'en', '' ) ).toEqual(
			'/start/wpcc?oauth2_client_id=69040&oauth2_redirect=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%3Fresponse_type%3Dtoken%26client_id%3D69040%26redirect_uri%3Dhttps%253A%252F%252Fcloud.jetpack.com%252Fconnect%252Foauth%252Ftoken%253Fnext%253D%25252Fpricing%26scope%3Dglobal%26blog_id%3D0%26from-calypso%3D1'
		);
	} );

	test( 'signup_flow modifies /start base', () => {
		expect( getSignupUrl( { signup_flow: 'test' }, '/log-in', null, 'en', '' ) ).toEqual(
			'/start/test'
		);
		expect(
			getSignupUrl(
				{ signup_flow: 'test', redirect_to: 'https://example.com' },
				'/log-in',
				null,
				'en',
				''
			)
		).toEqual( '/start/test?redirect_to=https%3A%2F%2Fexample.com' );
		expect(
			getSignupUrl(
				{ signup_flow: 'account', redirect_to: 'https://example.com' },
				'/log-in',
				null,
				'en',
				''
			)
		).toEqual( '/start/account?redirect_to=https%3A%2F%2Fexample.com' );
	} );

	test( '/log-in/jetpack uses /jetpack/connect', () => {
		expect( getSignupUrl( {}, '/log-in/jetpack', null, 'en', '' ) ).toEqual( '/jetpack/connect' );
		expect( getSignupUrl( {}, '/log-in/jetpack/es', null, 'es', '' ) ).toEqual(
			'/jetpack/connect'
		);
	} );

	test( '/log-in/jetpack?redirect_to with nonce uses redirect_to', () => {
		expect(
			getSignupUrl(
				{ redirect_to: 'https://example.com/jetpack/connect/authorize?&_wp_nonce=example' },
				'/log-in/jetpack',
				null,
				'en',
				''
			)
		).toEqual( 'https://example.com/jetpack/connect/authorize?&_wp_nonce=example' );
	} );

	test( '/log-in/jetpack?redirect_to without nonce uses /jetpack/connect', () => {
		expect(
			getSignupUrl( { redirect_to: 'https://example.com' }, '/log-in/jetpack', null, 'en', '' )
		).toEqual( '/jetpack/connect' );
	} );

	test( 'redirect_to=public.api/connect/?action=verify uses /start/account with ?redirect_to passthrough', () => {
		expect(
			getSignupUrl(
				{ redirect_to: 'https://public-api.wordpress.com/public.api/connect/?action=verify' },
				'/log-in',
				null,
				'en',
				''
			)
		).toEqual(
			'/start/account?redirect_to=https%3A%2F%2Fpublic-api.wordpress.com%2Fpublic.api%2Fconnect%2F%3Faction%3Dverify'
		);
	} );
} );

describe( 'getPluginTitle', () => {
	const translate = ( str ) => {
		return str;
	};
	it( 'should return the title for a single valid plugin name', () => {
		const result = getPluginTitle( 'jetpack-ai', translate );
		expect( result ).toBe( 'Jetpack' );
	} );

	it( 'should return titles joined with "and" for two plugin names', () => {
		const result = getPluginTitle( 'jetpack-ai,woocommerce-payments', translate );
		expect( result ).toBe( 'Jetpack and WooPayments' );
	} );

	it( 'should return titles joined with a serial comma and "and" for three plugin names', () => {
		const result = getPluginTitle( 'jetpack-ai,woocommerce-payments,order-attribution', translate );
		expect( result ).toBe( 'Jetpack, WooPayments, and Order Attribution' );
	} );

	it( 'should return the default title for an invalid plugin name', () => {
		const result = getPluginTitle( 'unknown-plugin', translate );
		expect( result ).toBe( 'Jetpack, WooPayments, and Order Attribution' ); // Default value
	} );

	it( 'should return the default title for null input', () => {
		const result = getPluginTitle( null, translate );
		expect( result ).toBe( 'Jetpack, WooPayments, and Order Attribution' ); // Default value
	} );

	it( 'should return the default title for an empty string', () => {
		const result = getPluginTitle( '', translate );
		expect( result ).toBe( 'Jetpack, WooPayments, and Order Attribution' ); // Default value
	} );

	it( 'should handle a mix of valid and invalid plugin names', () => {
		const result = getPluginTitle( 'jetpack-ai,unknown-plugin,woocommerce-payments', translate );
		expect( result ).toBe( 'Jetpack and WooPayments' ); // Default for invalid names
	} );

	it( 'should handle extra whitespace in plugin names', () => {
		const result = getPluginTitle( ' jetpack-ai ,, woocommerce-payments ', translate );
		expect( result ).toBe( 'Jetpack and WooPayments' );
	} );

	it( 'should handle French formatting for three plugin names', () => {
		const result = getPluginTitle(
			'jetpack-ai,woocommerce-payments,order-attribution',
			translate,
			'fr'
		);
		expect( result ).toBe( 'Jetpack, WooPayments et Order Attribution' );
	} );
} );
