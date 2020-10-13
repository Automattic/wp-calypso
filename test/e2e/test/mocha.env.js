process.env.SELENIUM_PROMISE_MANAGER = '0';

/**
 * External dependencies (can also be listed in the root package.json)
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const execa = require( 'execa' );

// Make sure that puppeteer and chromedriver are installed before running tests
try {
	execa.sync( 'node', [ require.resolve( 'puppeteer/install' ) ], {
		env: {
			PUPPETEER_SKIP_DOWNLOAD: '',
			PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: '',
		},
		stdio: 'inherit',
	} );

	execa.sync( 'node', [ require.resolve( 'chromedriver/install' ) ], {
		env: {
			CHROMEDRIVER_SKIP_DOWNLOAD: '',
		},
		stdio: 'inherit',
	} );
} catch ( error ) {
	console.error( error );
}
