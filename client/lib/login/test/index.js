import { pathWithLeadingSlash, getSignupUrl } from 'calypso/lib/login';

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
			'/log-in/link?redirect_to=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%3Fclient_id%3D1854%26response_type%3Dcode%26blog_id%3D0%26state%3D1234%26redirect_uri%3Dhttps%253A%252F%252Fgravatar.com%252Fconnect%252F%253Faction%253Drequest_access_token%26from-calypso%3D1&client_id=1854'
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
} );
