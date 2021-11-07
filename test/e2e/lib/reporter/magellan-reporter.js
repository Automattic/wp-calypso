const util = require( 'util' );
const fs = require( 'fs-extra' );
const BaseReporter = require( 'testarmada-magellan' ).Reporter;

const Reporter = function () {};

util.inherits( Reporter, BaseReporter );

Reporter.prototype.listenTo = function ( testRun, test, source ) {
	// Print STDOUT/ERR to the screen for extra debugging
	if ( process.env.MAGELLANDEBUG ) {
		source.stdout.pipe( process.stdout );
		source.stderr.pipe( process.stderr );
	}

	// Create global screenshots directory
	let finalScreenshotDir = './screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		finalScreenshotDir = `./${ process.env.SCREENSHOTDIR }`;
	}

	let screenshotDir = testRun.tempAssetPath + '/screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		screenshotDir = testRun.tempAssetPath + `/${ process.env.SCREENSHOTDIR }`;
	}

	fs.mkdir( finalScreenshotDir, () => {} );

	source.on( 'message', ( msg ) => {
		if ( msg.type === 'worker-status' ) {
			const passCondition = msg.passed;
			const failCondition =
				! msg.passed && msg.status === 'finished' && test.maxAttempts === test.attempts + 1;

			// If the test failed on the final retry, send Slack notifications
			if ( failCondition ) {
				// Screenshots
				fs.readdir( screenshotDir, ( dirErr, files ) => {
					if ( dirErr ) return 1;

					files
						.filter( ( file ) => file.match( /png$/i ) )
						.forEach( ( screenshotPath ) => {
							copyScreenshots( screenshotDir, screenshotPath, finalScreenshotDir );
						} );
				} );
			}

			// Also move the screenshots files if the test passed
			if ( passCondition ) {
				// Print skipped tests
				if ( test.locator.pending === true ) {
					console.log( '\x1b[35m', 'TEST SKIPPED: ' + test.locator.name );
				}

				// Screenshots
				fs.readdir( screenshotDir, ( dirErr, screenshotFiles ) => {
					if ( dirErr ) return 1;

					screenshotFiles
						.filter( ( file ) => file.match( /png$/i ) )
						.forEach( ( screenshotFile ) =>
							copyScreenshots( screenshotDir, screenshotFile, finalScreenshotDir )
						);
				} );
			}
		}
	} );
};

// Move to /screenshots for CircleCI artifacts
function copyScreenshots( dir, path, finalScreenshotDir ) {
	try {
		fs.copyFile( `${ dir }/${ path }`, `${ finalScreenshotDir }/${ path }`, ( moveErr ) => {
			if ( ! moveErr ) {
				return;
			}
		} );
	} catch ( e ) {
		console.log( `Error moving file, likely just timing race: ${ e.message }` );
	}
}

module.exports = Reporter;
