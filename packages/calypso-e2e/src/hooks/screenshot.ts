/**
 * Internal dependencies
 */
import { getScreenshotName } from '../media-helper';

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
	const test = this.currentTest;
	if ( ! test ) {
		return;
	}

	// If state does not exist, skip.
	const state = test.state?.toUpperCase();
	if ( ! state || state === 'PASSED' ) {
		return;
	}

	// If page does not exist, skip.
	const page = test.ctx?.page;
	if ( ! page ) {
		return;
	}

	await page.screenshot( { path: getScreenshotName( test.title ) } );
}
