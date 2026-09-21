const {
	appendE2EUserAgentSuffix,
	E2E_USER_AGENT_SUFFIX,
} = require( '../../app/lib/e2e-user-agent' );

const APP_USER_AGENT =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) ' +
	'WordPress.com/8.2.4 Chrome/142.0.7444.265 Electron/39.8.10 Safari/537.36';

describe( 'appendE2EUserAgentSuffix', () => {
	it( 'marks the user agent when launched by the E2E suite', () => {
		expect( appendE2EUserAgentSuffix( APP_USER_AGENT, { WP_DESKTOP_E2E: 'true' } ) ).toBe(
			`${ APP_USER_AGENT } ${ E2E_USER_AGENT_SUFFIX }`
		);
	} );

	it( 'leaves the shipped user agent untouched', () => {
		expect( appendE2EUserAgentSuffix( APP_USER_AGENT, {} ) ).toBe( APP_USER_AGENT );
	} );

	it( 'ignores a flag that is not exactly "true"', () => {
		expect( appendE2EUserAgentSuffix( APP_USER_AGENT, { WP_DESKTOP_E2E: '1' } ) ).toBe(
			APP_USER_AGENT
		);
	} );

	it( 'keeps the app identity alongside the marker', () => {
		const userAgent = appendE2EUserAgentSuffix( APP_USER_AGENT, { WP_DESKTOP_E2E: 'true' } );

		expect( userAgent ).toContain( 'WordPress.com/' );
		expect( userAgent ).toContain( 'Electron/' );
	} );
} );
