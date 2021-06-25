/* eslint-disable mocha/no-top-level-hooks */
/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { buildHooks as buildVideoHooks, isVideoEnabled } from './video';
import { buildHooks as buildBrowserHooks } from './browser';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

let tempDir;
beforeAll(async () => {
	tempDir = process.env.TEMP_ASSET_PATH || ( await mkdtemp( path.resolve( __dirname, '../../test-' ) ) );
});

if ( isVideoEnabled() ) {
	const {
		startFramebuffer,
		stopFramebuffer,
		// takeScreenshot,
		startVideoRecording,
		// saveVideoRecording,
		stopVideoRecording,
	} = buildVideoHooks();

	beforeAll( async () => {
		await startFramebuffer();
		await startVideoRecording( { tempDir } );
	} );

	// afterEach( async () => {
	// 	if ( this.currentTest && this.currentTest.state === 'failed' ) {
	// 		await takeScreenshot( {
	// 			tempDir,
	// 			testName: this.currentTest.title,
	// 			driver,
	// 		} );
	// 		await saveVideoRecording( { tempDir, testName: this.currentTest.title } );
	// 	}
	// } );

	afterAll( async () => {
		await stopFramebuffer();
		await stopVideoRecording();
	} );
}

const browserHooks = buildBrowserHooks();
beforeAll( async () => {
	const driver = await browserHooks.createBrowser();
	global.__BROWSER__ = driver;
}, startBrowserTimeoutMS );

afterAll( async () => {
	await browserHooks.saveBrowserLogs( { tempDir } );
	await browserHooks.closeBrowser();
} );
