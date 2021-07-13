import { mkdtemp } from 'fs/promises';
import path from 'path';
import config from 'config';
import { buildHooks as buildBrowserHooks } from './browser';
import { buildHooks as buildVideoHooks, isVideoEnabled } from './video';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

export const mochaHooks = async () => {
	const tempDir =
		process.env.TEMP_ASSET_PATH || ( await mkdtemp( path.resolve( __dirname, '../../test-' ) ) );

	let driver;
	const hooks = {
		afterAll: [],
		beforeAll: [],
		afterEach: [],
	};

	if ( isVideoEnabled() ) {
		const {
			startFramebuffer,
			stopFramebuffer,
			takeScreenshot,
			startVideoRecording,
			saveVideoRecording,
			stopVideoRecording,
		} = buildVideoHooks();

		hooks.beforeAll.push( async function () {
			await startFramebuffer();
			await startVideoRecording( { tempDir } );
		} );

		hooks.afterEach.push( async function () {
			if ( this.currentTest && this.currentTest.state === 'failed' ) {
				await takeScreenshot( {
					tempDir,
					testName: this.currentTest.title,
					driver,
				} );
				await saveVideoRecording( { tempDir, testName: this.currentTest.title } );
			}
		} );

		hooks.afterAll.push( async function () {
			await stopFramebuffer();
			await stopVideoRecording();
		} );
	}

	const browserHooks = buildBrowserHooks();

	hooks.beforeAll.push( async function createBrowserHook() {
		this.timeout( startBrowserTimeoutMS );
		driver = await browserHooks.createBrowser();
		this.driver = driver;
	} );

	hooks.afterAll.push( async function () {
		await browserHooks.saveBrowserLogs( { tempDir } );
		await browserHooks.closeBrowser();
	} );

	return hooks;
};
