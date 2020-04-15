const BaseReporter = require( 'testarmada-magellan' ).Reporter;
const util = require( 'util' );

// Requirements for Slack output
const slack = require( 'slack-notify' );
const config = require( 'config' );
const fs = require( 'fs-extra' );
const XunitViewerParser = require( 'xunit-viewer/parser' );
const pngitxt = require( 'png-itxt' );

const Reporter = function () {};

util.inherits( Reporter, BaseReporter );

Reporter.prototype.listenTo = function ( testRun, test, source ) {
	// Print STDOUT/ERR to the screen for extra debugging
	if ( process.env.MAGELLANDEBUG ) {
		source.stdout.pipe( process.stdout );
		source.stderr.pipe( process.stderr );
	}

	// Create global report and screenshots directories
	let finalScreenshotDir = './screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		finalScreenshotDir = `./${ process.env.SCREENSHOTDIR }`;
	}

	const reportDir = testRun.tempAssetPath + '/reports';
	let screenshotDir = testRun.tempAssetPath + '/screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		screenshotDir = testRun.tempAssetPath + `/${ process.env.SCREENSHOTDIR }`;
	}

	fs.mkdir( finalScreenshotDir, () => {} );
	fs.mkdir( './reports', () => {} );

	// Only enable Slack messages on the master branch
	const slackClient = getSlackClient();

	source.on( 'message', ( msg ) => {
		if ( msg.type === 'worker-status' ) {
			const passCondition = msg.passed;
			const failCondition =
				! msg.passed && msg.status === 'finished' && test.maxAttempts === test.attempts + 1;
			const testObject = {
				title: test.locator.title,
				fullTitle: test.locator.name,
				duration: test.runningTime,
				err: {},
			};

			// If the test failed on the final retry, send Slack notifications
			if ( failCondition ) {
				// Reports
				sendFailureNotif( slackClient, reportDir, testRun );

				// Screenshots
				fs.readdir( screenshotDir, ( dirErr, files ) => {
					if ( dirErr ) return 1;

					files
						.filter( ( file ) => file.match( /png$/i ) )
						.forEach( ( screenshotPath ) => {
							// Send screenshot to Slack on master branch only
							if (
								config.has( 'slackTokenForScreenshots' ) &&
								process.env.CIRCLE_BRANCH === 'master' &&
								! process.env.LIVEBRANCHES
							) {
								const SlackUpload = require( 'node-slack-upload' );
								const slackUpload = new SlackUpload( config.get( 'slackTokenForScreenshots' ) );
								const slackChannel = configGet( 'slackChannelForScreenshots' );

								try {
									fs.createReadStream( `${ screenshotDir }/${ screenshotPath }` ).pipe(
										pngitxt.get( 'url', ( url ) => {
											slackUpload.uploadFile(
												{
													file: fs.createReadStream( `${ screenshotDir }/${ screenshotPath }` ),
													title: `${ screenshotPath } - # ${ process.env.CIRCLE_BUILD_NUM }`,
													initialComment: url,
													channels: slackChannel,
												},
												( err ) => {
													if ( ! err ) return;

													slackClient.send( {
														icon_emoji: ':a8c:',
														text: `Build <https://circleci.com/gh/${ process.env.CIRCLE_PROJECT_USERNAME }/${ process.env.CIRCLE_PROJECT_REPONAME }/${ process.env.CIRCLE_BUILD_NUM }|#${ process.env.CIRCLE_BUILD_NUM }> Upload to slack failed: '${ err }'`,
														username: 'e2e Test Runner',
													} );
												}
											);
										} )
									);
								} catch ( e ) {
									console.log(
										`Error reading screenshot file, likely just timing race: ${ e.message }`
									);
								}
							}
							copyScreenshots( slackClient, screenshotDir, screenshotPath, finalScreenshotDir );
						} );
				} );
			}

			// Also move the report/screenshots files if the test passed
			if ( passCondition ) {
				// Notify if the test was retried
				if ( test.attempts > 0 ) {
					slackClient.send( {
						icon_emoji: ':a8c:',
						text: `FYI - The following test failed, retried, and passed: (${ process.env.BROWSERSIZE }) ${ testObject.title } - Build <https://circleci.com/gh/${ process.env.CIRCLE_PROJECT_USERNAME }/${ process.env.CIRCLE_PROJECT_REPONAME }/${ process.env.CIRCLE_BUILD_NUM }|#${ process.env.CIRCLE_BUILD_NUM }>`,
						username: 'e2e Test Runner',
					} );
				}

				// Reports
				fs.readdir( reportDir, ( dirErr, reportFiles ) => {
					if ( dirErr ) return 1;

					reportFiles
						.filter( ( file ) => file.match( /xml$/i ) )
						.forEach( ( reportPath ) =>
							copyReports( slackClient, reportDir, reportPath, testRun.guid )
						);
				} );

				// Screenshots
				fs.readdir( screenshotDir, ( dirErr, screenshotFiles ) => {
					if ( dirErr ) return 1;

					screenshotFiles
						.filter( ( file ) => file.match( /png$/i ) )
						.forEach( ( screenshotFile ) =>
							copyScreenshots( slackClient, screenshotDir, screenshotFile, finalScreenshotDir )
						);
				} );
			}
		}
	} );
};

function configGet( key ) {
	const target = process.env.TARGET || null;

	if ( target && config.has( target ) ) {
		const targetConfig = config.get( target );
		if ( targetConfig.has( key ) ) {
			return targetConfig.get( key );
		}
	}

	return config.get( key );
}

// Move to /reports for CircleCI artifacts
function copyReports( slackClient, reportDir, reportPath, guid ) {
	if ( reportDir === './reports' ) {
		return;
	}
	try {
		fs.copyFile(
			`${ reportDir }/${ reportPath }`,
			`./reports/${ guid }_${ reportPath }`,
			( moveErr ) => {
				if ( ! moveErr ) {
					return;
				}
				slackClient.send( {
					icon_emoji: ':a8c:',
					text: `Build <https://circleci.com/gh/${ process.env.CIRCLE_PROJECT_USERNAME }/${ process.env.CIRCLE_PROJECT_REPONAME }/${ process.env.CIRCLE_BUILD_NUM }|#${ process.env.CIRCLE_BUILD_NUM }> Moving file to /reports failed: '${ moveErr }'`,
					username: 'e2e Test Runner',
				} );
			}
		);
	} catch ( e ) {
		console.log( `Error moving file, likely just timing race: ${ e.message }` );
	}
}

// Move to /screenshots for CircleCI artifacts
function copyScreenshots( slackClient, dir, path, finalScreenshotDir ) {
	try {
		fs.copyFile( `${ dir }/${ path }`, `${ finalScreenshotDir }/${ path }`, ( moveErr ) => {
			if ( ! moveErr ) {
				return;
			}
			slackClient.send( {
				icon_emoji: ':a8c:',
				text: `Build <https://circleci.com/gh/${ process.env.CIRCLE_PROJECT_USERNAME }/${ process.env.CIRCLE_PROJECT_REPONAME }/${ process.env.CIRCLE_BUILD_NUM }|#${ process.env.CIRCLE_BUILD_NUM }> Moving file to screenshots directory failed: '${ moveErr }'`,
				username: 'e2e Test Runner',
			} );
		} );
	} catch ( e ) {
		console.log( `Error moving file, likely just timing race: ${ e.message }` );
	}
}

// Only enable Slack messages on the master branch & not for live branches
function getSlackClient() {
	if ( process.env.CIRCLE_BRANCH === 'master' && ! process.env.LIVEBRANCHES ) {
		const slackHook = configGet( 'slackHook' );
		return slack( slackHook );
	}
	return { send: () => {} };
}

function sendFailureNotif( slackClient, reportDir, testRun ) {
	let files;
	let failuresCount = 0;
	try {
		files = fs.readdirSync( reportDir );
	} catch ( e ) {
		console.log( `Failed to read directory, maybe it doesn't exist: ${ e.message }` );
		return;
	}
	files.forEach( ( reportPath ) => {
		if ( ! reportPath.match( /xml$/i ) ) {
			return;
		}
		try {
			const xmlString = fs.readFileSync( `${ reportDir }/${ reportPath }`, 'utf-8' );
			const xmlData = XunitViewerParser.parse( xmlString );
			failuresCount += xmlData[ 0 ].tests.filter( ( t ) => t.status === 'fail' ).length;
		} catch ( e ) {
			console.log( `Error reading report file, likely just timing race: ${ e.message }` );
		}
		copyReports( slackClient, reportDir, reportPath, testRun.guid );
	} );

	const fieldsObj = { Error: `${ failuresCount } failed tests` };
	if ( process.env.DEPLOY_USER ) {
		fieldsObj[ 'Git Diff' ] =
			'<https://github.com/Automattic/wp-calypso/compare/' +
			process.env.PROD_REVISION +
			'...' +
			process.env.TO_DEPLOY_REVISION +
			'|Compare Commits>';
		fieldsObj.Author = process.env.DEPLOY_USER;
	}

	slackClient.send( {
		icon_emoji: ':a8c:',
		text: `<!subteam^S0G7K98MB|flow-patrol-squad-team> Test Run Failed - Build <https://circleci.com/gh/${ process.env.CIRCLE_PROJECT_USERNAME }/${ process.env.CIRCLE_PROJECT_REPONAME }/${ process.env.CIRCLE_BUILD_NUM }|#${ process.env.CIRCLE_BUILD_NUM }>`,
		fields: fieldsObj,
		username: 'e2e Test Runner',
	} );
}

module.exports = Reporter;
