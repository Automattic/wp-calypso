import { mkdir, unlink } from 'fs/promises';
import path from 'path';
import { beforeAll, afterAll } from '@jest/globals';
import { BrowserContext, chromium, Page, Video } from 'playwright';
import { getDefaultLoggerConfiguration } from './browser-helper';
import { closeBrowser, startBrowser, newBrowserContext, browser } from './browser-manager';
import { getDateString } from './data-helper';

// These are defined in our custom Jest environment (test/e2e/lib/jest/environment.js)
declare const __CURRENT_TEST_FAILED__: boolean;
declare const __CURRENT_TEST_NAME__: string;
declare const artifactPath: string;

/**
 * Generates a filename using the test name and a date string.
 *
 * @param {string} testName The test name.
 * @returns The filename.
 */
function getTestNameWithTime( testName: string ): string {
	// Clean up the test name to be entirely lowercase and removing whitespace.
	const currentTestName = testName.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	// Obtain the ISO date string and replace non-supported filename chars with hyphens.
	const dateTime = getDateString( 'ISO' )!.split( '.' )[ 0 ].replace( /:/g, '-' );
	return `${ currentTestName }-${ dateTime }`;
}

/**
 * Set up hoooks used for Jest tests.
 *
 * This method must be called once on the top `describe` block. It will set up a browser
 * screenshot and video-recording capabilities. It will call the provided callback with an instance
 * of the browser, so tests can use it to run actions and make assertions.
 *
 * @param callback Function to be called with the browser instance.
 */
export const setupHooks = ( callback: ( { page }: { page: Page } ) => void ): void => {
	let page: Page;
	let context: BrowserContext;

	beforeAll( async () => {
		// Obtain the default logger configuration.
		const loggingConfiguration = await getDefaultLoggerConfiguration( artifactPath );

		// Start the browser
		await startBrowser( chromium );

		// Launch context with logging.
		context = await newBrowserContext( loggingConfiguration );

		// Begin tracing the context.
		await context.tracing.start( { screenshots: true, snapshots: true } );

		// Launch a new page within the context.
		page = await context.newPage();
		callback( { page } );
	} );

	afterAll( async () => {
		if ( ! browser ) {
			throw new Error( 'No browser instance found.' );
		}

		const testName = __CURRENT_TEST_NAME__;

		// Take screenshot for failed tests
		if ( __CURRENT_TEST_FAILED__ ) {
			const fileName = path.join(
				artifactPath,
				'screenshots',
				`${ getTestNameWithTime( testName ) }.png`
			);
			await mkdir( path.dirname( fileName ), { recursive: true } );
			await page.screenshot( { path: fileName } );
		}
		// Close the page. This needs to be called before trying to access
		// the video recording.
		await page.close();

		// Stop tracing and remove the trace output if the test did not fail.
		const traceOutputPath = path.join( artifactPath, `${ getTestNameWithTime( testName ) }.zip` );
		await context.tracing.stop( { path: traceOutputPath } );
		if ( ! __CURRENT_TEST_FAILED__ ) {
			await unlink( traceOutputPath );
		}

		if ( __CURRENT_TEST_FAILED__ ) {
			const destination = path.join(
				artifactPath,
				'screenshots',
				`${ getTestNameWithTime( testName ) }.webm`
			);
			try {
				// Save the failing test case with a specific name.
				await page.video()?.saveAs( destination );
			} catch ( err ) {
				console.error( `Failed to save video of failing test case.\nSee stack trace:` );
				console.trace( err );
			}
		}

		// In all cases, clean up the directory after itself.
		await ( page.video() as Video ).delete();
		await closeBrowser();
	} );
};
