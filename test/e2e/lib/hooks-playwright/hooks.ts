/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import fs from 'fs';
import { BrowserManager, MediaHelper } from '@automattic/calypso-e2e';
import { beforeSuite, afterSuite } from 'mocha-suite-hooks';

let failedSuites;

/**
 * Hook to launch browser instance and set up the environment.
 *
 * @returns {void} No return value.
 */
beforeSuite( async function startBrowser() {
	// Clear the list of failures at beginning of each suite.
	failedSuites = [];
	this.page = await BrowserManager.start();
} );

/**
 * Hook to tabulate names of failed test suites.
 *
 * @returns {void} No return value.
 */
afterEach( async function collectFailedTests() {
	if ( this.currentTest.state.toUpperCase() === 'FAILED' ) {
		failedSuites.push( this.currentTest.parent.title );
	}
} );

/**
 * Hook to handle video recording.
 *
 * If all tests in the suite passes, the video recording is deleted.
 * If any tests in the suite fails, the video recording is saved.
 * The video recording will cover the suite from beginning to end.
 *
 * @returns {void} No return value.
 */
afterSuite( async function recordVideo() {
	// Obtain the default save path that Playwright generates for the page.
	const defaultVideoPath = await this.page.video().path();

	// Close the BrowserContext to have the video be saved.
	await this.page.context().close();

	// Clean up the saved video if the suite had only passes.
	if ( failedSuites.length === 0 ) {
		fs.unlink( defaultVideoPath, function ( err ) {
			if ( err ) {
				console.log( 'Failed to delete video recording of passed test case.' );
			}
		} );
		return;
	}

	// If we are here, there was a failure in the test suite.
	// Set up the file name to be used for the video.
	const suiteName = await this.test.parent.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const locale = BrowserManager.getTargetLocale().toUpperCase();
	const screenSize = BrowserManager.getTargetScreenSize().toUpperCase();
	const date = MediaHelper.getDateString();
	const fileName = `FAILED-${ locale }-${ screenSize }-${ suiteName }-${ date }`;
	const videoDir = MediaHelper.getVideoDir();
	const videoPath = `${ videoDir }/${ fileName }.webm`;

	// Playwright does not offer option to specify save name for video,
	// so we must build the path ourselves (similar to screenshot) then
	// use `fs` to rename the video file.
	try {
		fs.renameSync( defaultVideoPath, videoPath );
		console.log( `Video file saved as ${ videoPath }` );
	} catch ( error ) {
		console.log( `Renaming video file failed! \n ${ error }` );
	}
	failedSuites = [];
} );

/**
 * Hook to terminate a Browser instance.
 *
 * @returns {void} No return value.
 */
after( 'Close browser', async function () {
	await BrowserManager.browser.close();
} );
