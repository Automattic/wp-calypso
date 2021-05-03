/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import { BrowserManager } from '@automattic/calypso-e2e';

/**
 * Hook to record video of the test execution.
 *
 * @returns {void} No return value.
 */
afterEach( 'Capture video', async function () {
	if ( ! this.currentTest ) {
		return;
	}

	// This is the default save path that Playwright generates.
	const defaultVideoPath = await this.currentTest.page.video().path();
	const state = this.currentTest.state.toUpperCase();

	// We must close the BrowserContext for the video to be saved.
	await this.browserContext.close();

	// Remove the saved video if test did not fail.
	if ( state !== 'FAILED' ) {
		fs.unlink( defaultVideoPath, function ( err ) {
			if ( err ) {
				console.log( 'Failed to delete video recording of passed test case.' );
			}
		} );
		return;
	}

	// Setup of the file in case it needs to be saved.
	const shortTestFileName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const locale = BrowserManager.getTargetLocale().toUpperCase();
	const date = MediaHelper.getDateString();
	const fileName = `${ state }-${ locale }-${ shortTestFileName }-${ date }`;
	const videoDir = MediaHelper.getVideoDir();
	console.log( videoDir );
	const videoPath = `${ videoDir }/${ fileName }.webm`;

	// Playwright does not offer option to specify save name for video,
	// so we must build the path ourselves (similar to screenshot) then
	// use `fs` to rename the video file.
	fs.rename( defaultVideoPath, videoPath, function ( err ) {
		if ( err ) {
			console.log(
				`Failed to rename video file; retaining default filename ${ defaultVideoPath }`
			);
		}
	} );
} );

/**
 * Hook to terminate a Browser instance.
 *
 * @returns {void} No return value.
 */
after( 'Close browser', async function () {
	await BrowserManager.browser.close();
} );
