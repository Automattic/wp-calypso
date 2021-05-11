/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { getTargetLocale, getTargetScreenSize } from '../browser-manager';
import { getDateString, getScreenshotDir } from '../media-helper';

/**
 * Type dependencies
 */
import type { Context } from 'mocha';

/**
 * Function to capture screenshot of a page.
 *
 * @param {Context} this - Mocha Test Context.
 * @returns {void} No return value.
 */
export async function saveScreenshot( this: Context ): Promise< void > {
	// If no test has been run, skip.
	const test = await this.currentTest;
	if ( ! test ) {
		return;
	}

	// If state does not exist, skip.
	const state = test.state?.toUpperCase();
	if ( ! state ) {
		return;
	}

	// If page does not exist, skip.
	const page = test.ctx?.page;
	if ( ! page ) {
		return;
	}

	// If option is set to never save screenshots, skip.
	const doNotSaveScreenshot = config.get( 'neverSaveScreenshots' );
	if ( doNotSaveScreenshot ) {
		return;
	}

	// If test passes and option to save all screenshot is not set, skip.
	const saveAllScreenshot = config.get( 'saveAllScreenshots' );
	if ( state === 'PASSED' && ! saveAllScreenshot ) {
		return;
	}

	// If we are here, screenshot needs to be captured.
	// Build the necessary components of the filename then call Playwright's
	// built-in screenshot utility to output a PNG file.
	const shortTestFileName = test.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const screenSize = getTargetScreenSize().toUpperCase();
	const locale = getTargetLocale().toUpperCase();
	const date = getDateString();
	const fileName = `${ state }-${ locale }-${ screenSize }-${ shortTestFileName }-${ date }`;
	const screenshotDir = getScreenshotDir();
	const screenshotPath = `${ screenshotDir }/${ fileName }.png`;

	await page.screenshot( { path: screenshotPath } );
}
