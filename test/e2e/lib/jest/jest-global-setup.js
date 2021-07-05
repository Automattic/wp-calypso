/**
 * External dependencies
 */
import { node } from 'execa';

module.exports = async () => {
	// Update chromedriver
	const subprocess = node( require.resolve( 'chromedriver/install.js' ), {
		env: {
			CHROMEDRIVER_SKIP_DOWNLOAD: false,
			DETECT_CHROMEDRIVER_VERSION: true,
		},
	} );
	subprocess.stdout.pipe( process.stdout );
	subprocess.stderr.pipe( process.stderr );
	await subprocess;
};
