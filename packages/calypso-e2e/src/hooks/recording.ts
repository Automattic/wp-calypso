/**
 * External dependencies
 */
import * as fs from 'fs/promises';
import { Context } from 'mocha';

/**
 * Internal dependencies
 */
import { getVideoName } from '../media-helper';

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

	if ( this.failedTest.length === 0 ) {
		// Videos for passing tests are currently not saved.
		await this.page.video().delete();
	} else {
		const original = await this.page.video().path();
		const custom = getVideoName( this.failedTest[ 0 ] );
		try {
			await fs.rename( original, custom );
		} catch ( err ) {
			console.log( 'Failed to rename video of failing test case.' );
		}
	}
}
