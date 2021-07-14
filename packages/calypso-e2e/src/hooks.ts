/**
 * External dependencies
 */
import { beforeAll, afterAll } from '@jest/globals';
import type { Page, Video } from 'playwright';
import path from 'path';
import { mkdtemp, mkdir, rename, appendFile } from 'fs/promises';
import { getState } from 'expect';

import { getTestNameWithTime } from './media-helper';

/**
 * Internal dependencies
 */
import { start, close } from './browser-manager';

// These are defined in our custom Jest environment (test/e2e/lib/jest/environment.js)
declare const __CURRENT_TEST_FAILED__: boolean;
declare const __CURRENT_TEST_NAME__: string;

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
	let tempDir: string;

	beforeAll( async () => {
		// Create dir for storing test files
		const { testPath } = getState() as { testPath: string };
		const sanitizedTestFilename = path.basename( testPath, path.extname( testPath ) );
		const resultsPath = path.join( process.cwd(), 'results' );
		await mkdir( resultsPath, { recursive: true } );
		tempDir = await mkdtemp( path.join( resultsPath, sanitizedTestFilename + '-' ) );

		// Start the browser
		page = await start( {
			logger: async ( name, severity, message ) => {
				await appendFile(
					path.join( tempDir, 'playwright.log' ),
					`${ new Date().toISOString() } ${ process.pid } ${ name } ${ severity }: ${ message }\n`
				);
			},
		} );
		callback( { page } );
	} );

	afterAll( async () => {
		const testName = __CURRENT_TEST_NAME__;

		// Take screenshot for failed tests
		if ( __CURRENT_TEST_FAILED__ ) {
			const fileName = path.join(
				tempDir,
				'screenshots',
				`${ getTestNameWithTime( testName ) }.png`
			);
			await mkdir( path.dirname( fileName ), { recursive: true } );
			await page.screenshot( { path: fileName } );
		}

		// Close the browser. This needs to be called before trying to access
		// the video recording
		await page.close();

		// Save video
		if ( __CURRENT_TEST_FAILED__ ) {
			const original = await ( page.video() as Video ).path();
			const destination = path.join(
				tempDir,
				'screenshots',
				`${ getTestNameWithTime( testName ) }.webm`
			);
			try {
				await rename( original, destination );
			} catch ( err ) {
				console.error( 'Failed to rename video of failing test case.' );
			}
		} else {
			await ( page.video() as Video ).delete();
		}

		await close();
	} );
};
