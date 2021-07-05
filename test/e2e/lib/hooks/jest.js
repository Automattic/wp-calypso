/**
 * External dependencies
 */
import config from 'config';
import path from 'path';
import { mkdtemp, mkdir } from 'fs/promises';
import { getState } from 'expect';

/**
 * Internal dependencies
 */
import { buildHooks as buildVideoHooks, isVideoEnabled } from './video';
import { buildHooks as buildBrowserHooks } from './browser';

let tempDir;
let driver;
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const browserHooks = buildBrowserHooks();
const videoHooks = isVideoEnabled() ? buildVideoHooks() : null;

beforeAll( async () => {
	const { testPath } = getState();

	const sanitizedTestFilename = path.basename( testPath, path.extname( testPath ) );
	const resultsPath = path.join( __dirname, '../../results' );
	await mkdir( resultsPath, { recursive: true } );
	tempDir = await mkdtemp( path.join( resultsPath, sanitizedTestFilename + '-' ) );

	if ( isVideoEnabled() ) {
		await videoHooks.startFramebuffer();
		await videoHooks.startVideoRecording( { tempDir } );
	}

	driver = await browserHooks.createBrowser( { tempDir } );
	global.__BROWSER__ = driver;
}, startBrowserTimeoutMS );

afterAll( async () => {
	if ( isVideoEnabled() ) {
		if ( global.__CURRENT_TEST_FAILED__ ) {
			// Sometimes chrome crashes mid test. By wraping `takeScreenshot` in a try/catch we ensure
			// we at least get a video recording
			try {
				videoHooks.takeScreenshot( {
					tempDir,
					testName: global.__CURRENT_TEST_NAME__,
					driver: driver,
				} );
			} catch {}

			await videoHooks.saveVideoRecording( { tempDir, testName: global.__CURRENT_TEST_NAME__ } );
		}

		await videoHooks.stopFramebuffer();
		await videoHooks.stopVideoRecording();
	}

	await browserHooks.saveBrowserLogs( { tempDir } );
	await browserHooks.closeBrowser();
} );
