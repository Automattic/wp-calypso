/* eslint-disable mocha/no-top-level-hooks */
/**
 * External dependencies
 */
import config from 'config';
import path from 'path';
import { mkdtemp } from 'fs/promises';

/**
 * Internal dependencies
 */
import { buildHooks as buildVideoHooks, isVideoEnabled } from './video';
import { buildHooks as buildBrowserHooks } from './browser';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

let tempDir;
beforeAll( async () => {
	tempDir =
		process.env.TEMP_ASSET_PATH || ( await mkdtemp( path.resolve( __dirname, '../../test-' ) ) );
} );

if ( isVideoEnabled() ) {
	const {
		startFramebuffer,
		stopFramebuffer,
		takeScreenshot,
		startVideoRecording,
		saveVideoRecording,
		stopVideoRecording,
	} = buildVideoHooks();

	beforeAll( async () => {
		await startFramebuffer();
		await startVideoRecording( { tempDir } );
	} );

	afterEach( async () => {
		if ( global.__CURRENT_TEST_FAILED__ ) {
			await takeScreenshot( {
				tempDir,
				testName: global.__CURRENT_TEST_NAME__,
				driver: global.__BROWSER__,
			} );
			await saveVideoRecording( { tempDir, testName: global.__CURRENT_TEST_NAME__ } );
		}
	} );

	afterAll( async () => {
		await stopFramebuffer();
		await stopVideoRecording();
	} );
}

const browserHooks = buildBrowserHooks();
beforeAll( async () => {
	const driver = await browserHooks.createBrowser( { tempDir } );
	global.__BROWSER__ = driver;
}, startBrowserTimeoutMS );

afterAll( async () => {
	await browserHooks.saveBrowserLogs( { tempDir } );
	await browserHooks.closeBrowser();
} );
