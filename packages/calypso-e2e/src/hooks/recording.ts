/**
 * External dependencies
 */
import * as fs from 'fs/promises';
import { Context } from 'mocha';

/**
 * Internal dependencies
 */
import { getTargetLocale, getTargetScreenSize } from '../browser-manager';
import { getDateString, getVideoDir } from '../media-helper';

export async function clearFailedTest( this: Context ): Promise< void > {
	// String here would be more logical as combination of magellan + mocha should result
	// in at most one failure per run of mocha.
	// However, using a string here causes the recorded failures to not survive the context
	// when the after hook is run whereas an array would.
	this.failedTest = [];
}

/**
 * Tracks failed tests per suite.
 *
 * @param {Context} this Current mocha context at the test level.
 * @returns {void} No return value.
 */
export async function recordFailedTestName( this: Context ): Promise< void > {
	// Guard against the attribute not existing.
	if ( ! this.currentTest || ! this.currentTest.state || ! this.currentTest.parent ) {
		return;
	}

	const state: string = this.currentTest.state.toUpperCase();
	if ( state === 'FAILED' ) {
		const fullName =
			this.currentTest?.parent.title.toString() + ' ' + this.currentTest?.title.toString();
		this.currentTest.parent.ctx.failedTest.push( fullName );
	}
}

/**
 * Hook to handle video recording.
 *
 * If all tests in the suite passes, the video recording is deleted.
 * If any tests in the suite fails, the video recording is saved.
 * The video recording will cover the suite from beginning to end.
 *
 * @param {Context} this Current mocha context at the suite level.
 * @returns {void} No return value.
 */
export async function saveVideo( this: Context ): Promise< void > {
	// Guard against page object not being present in this context.
	if ( ! this.page ) {
		return;
	}

	// Obtain the default save path that Playwright generates for the page.
	const defaultVideoPath: string = await this.page.video().path();

	// Close the BrowserContext so the video is written to disk.
	await this.page.context().close();

	// Process the written video file depending on suite state.
	if ( this.failedTest.length === 0 ) {
		await removeVideo( defaultVideoPath );
	} else {
		await renameVideo( this, defaultVideoPath );
	}
}

/**
 * Removes the file located by the path asynchronously then cleans the slate for next tests.
 *
 * @param {string} path Path-like string locating the object to be removed from disk.
 * @returns {void} No return value.
 */
async function removeVideo( path: string ) {
	try {
		await fs.unlink( path );
	} catch ( err ) {
		console.log( 'Failed to delete video recording of passed test case.' );
	}
}

/**
 * Renames the file located by the path asynchronously then cleans the slate for next tests.
 *
 * Playwright does not offer option to specify save name for video.
 * Therefore to save videos with human-friendly names, the file must be renamed manually.
 *
 * @param {Context} context Current mocha context at the suite level.
 * @param {string} path Path-like string locating the object to be renamed on the disk.
 * @returns {void} No return value.
 */
async function renameVideo( context: Context, path: string ): Promise< void > {
	// Get the first (and only) failure from the failed test list.
	const suiteName = context.failedTest[ 0 ].replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const locale = getTargetLocale().toUpperCase();
	const screenSize = getTargetScreenSize().toUpperCase();
	const date = getDateString();
	const fileName = `FAILED-${ locale }-${ screenSize }-${ suiteName }-${ date }`;
	const videoDir = getVideoDir();
	const newPath = `${ videoDir }/${ fileName }.webm`;

	try {
		await fs.rename( path, newPath );
	} catch ( err ) {
		console.log( `Renaming video file failed! \n ${ err }` );
	}
}
