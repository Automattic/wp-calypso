import { login } from '..';

describe( 'login', () => {
	test( 'should return the login url', () => {
		const url = login();
		expect( url ).toBe( '/log-in' );
	} );

	test( 'should return the login url when the two factor auth page is supplied', () => {
		const url = login( { twoFactorAuthType: 'code' } );
		expect( url ).toBe( '/log-in/code' );
	} );

	test( 'should return the login url with encoded redirect url param', () => {
		const url = login( { redirectTo: 'https://wordpress.com/?search=test&foo=bar' } );
		expect( url ).toBe(
			'/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
		);
	} );

	test( 'should keep the two factor auth page when the redirect url is a Jetpack SSO login', () => {
		const redirectTo =
			'https://wordpress.com/wp-login.php?action=jetpack-sso&site_id=123&sso_nonce=abc';
		const url = login( { twoFactorAuthType: 'push', redirectTo } );
		expect( url ).toBe(
			'/log-in/push?redirect_to=https%3A%2F%2Fwordpress.com%2Fwp-login.php%3Faction%3Djetpack-sso%26site_id%3D123%26sso_nonce%3Dabc'
		);
	} );

	test( 'should return the login url with encoded email_address param', () => {
		const url = login( { emailAddress: 'foo@bar.com' } );
		expect( url ).toBe( '/log-in?email_address=foo%40bar.com' );
	} );

	test( 'should return the login url with encoded OAuth2 client ID param', () => {
		const url = login( { oauth2ClientId: 12345 } );
		expect( url ).toBe( '/log-in?client_id=12345' );
	} );

	test( 'should return the login url for Jetpack specific login', () => {
		const url = login( { isJetpack: true } );
		expect( url ).toBe( '/log-in/jetpack' );
	} );

	test( 'should return the login url preserving the "form" parameter', () => {
		const url = login( { isJetpack: true, from: 'potato' } );
		expect( url ).toBe( '/log-in/jetpack?from=potato' );
	} );

	test( 'should return the login url with WooCommerce.com handler', () => {
		const url = login( { oauth2ClientId: 12345, wccomFrom: 'testing' } );
		expect( url ).toBe( '/log-in?client_id=12345&wccom-from=testing' );
	} );

	test( 'should return the login url for requesting a magic login link', () => {
		const url = login( { useMagicLink: true } );
		expect( url ).toBe( '/log-in/link' );
	} );

	test( 'should return the login url for requesting a magic login link with encoded email_address param', () => {
		const url = login( { useMagicLink: true, emailAddress: 'foo@bar.com' } );
		expect( url ).toBe( '/log-in/link?email_address=foo%40bar.com' );
	} );

	test( 'should return the login url for Jetpack, ignoring useMagicLink parameter', () => {
		const url = login( { isJetpack: true, useMagicLink: true } );
		expect( url ).toBe( '/log-in/jetpack' );
	} );

	test( 'should extract "from" from redirectTo when not explicitly provided', () => {
		const url = login( {
			isJetpack: true,
			redirectTo:
				'https://site.com/wp-admin/admin.php?page=wc-admin&from=woocommerce-core-profiler',
		} );
		expect( url ).toContain( 'from=woocommerce-core-profiler' );
	} );

	test( 'should not override explicit "from" with value from redirectTo', () => {
		const url = login( {
			isJetpack: true,
			from: 'explicit-value',
			redirectTo:
				'https://site.com/wp-admin/admin.php?page=wc-admin&from=woocommerce-core-profiler',
		} );
		expect( url ).toContain( 'from=explicit-value' );
		expect( url ).not.toContain( 'from=woocommerce-core-profiler' );
	} );

	test( 'should extract "plugin_name" from redirectTo when not explicitly provided', () => {
		const url = login( {
			isJetpack: true,
			redirectTo:
				'https://site.com/wp-admin/admin.php?page=wc-admin&plugin_name=woocommerce-payments',
		} );
		expect( url ).toContain( 'plugin_name=woocommerce-payments' );
	} );

	test( 'should not override explicit "pluginName" with value from redirectTo', () => {
		const url = login( {
			isJetpack: true,
			pluginName: 'explicit-plugin',
			redirectTo:
				'https://site.com/wp-admin/admin.php?page=wc-admin&plugin_name=woocommerce-payments',
		} );
		expect( url ).toContain( 'plugin_name=explicit-plugin' );
		expect( url ).not.toContain( 'plugin_name=woocommerce-payments' );
	} );

	test( 'should return the login url with explicit "plugins" parameter', () => {
		const url = login( { isJetpack: true, plugins: 'jetpack,woocommerce' } );
		expect( url ).toBe( '/log-in/jetpack?plugins=jetpack%2Cwoocommerce' );
	} );

	test( 'should extract "plugins" from redirectTo when not explicitly provided', () => {
		const url = login( {
			isJetpack: true,
			redirectTo: 'https://site.com/wp-admin/admin.php?page=jetpack&plugins=jetpack%2Cwoocommerce',
		} );
		expect( url ).toContain( 'plugins=jetpack%2Cwoocommerce' );
	} );

	test( 'should not override explicit "plugins" with value from redirectTo', () => {
		const url = login( {
			isJetpack: true,
			plugins: 'jetpack',
			redirectTo: 'https://site.com/wp-admin/admin.php?page=jetpack&plugins=jetpack%2Cwoocommerce',
		} );
		expect( url ).toContain( 'plugins=jetpack' );
		expect( url ).not.toContain( 'plugins=jetpack%2Cwoocommerce' );
	} );
} );
