const execa = require( 'execa' );

process.env.SELENIUM_PROMISE_MANAGER = '0';

// Make sure that chromedriver is installed before running tests
try {
	execa.sync( 'node', [ require.resolve( 'chromedriver/install' ) ], {
		env: {
			CHROMEDRIVER_SKIP_DOWNLOAD: '',
		},
	} );
} catch ( error ) {
	if ( ! error.toString().includes( 'ChromeDriver is already available' ) ) {
		console.error( error );
	}
}
