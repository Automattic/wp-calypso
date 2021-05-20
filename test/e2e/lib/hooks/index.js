/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { buildHooks as buildVideoHooks } from './video-recorder';
import { buildHooks as buildFramebufferHooks, getFreeDisplay } from './framebuffer';
import { saveBrowserLogs } from './browser-logs';
import { createBrowser, closeBrowser } from './browser';

const isVideoEnabled = () => {
	const video = config.has( 'useTestVideo' )
		? config.get( 'useTestVideo' )
		: process.env.TEST_VIDEO;
	return video === 'true';
};

export const mochaHooks = async () => {
	const hooks = {
		afterAll: [],
		beforeAll: [],
		afterEach: [],
	};

	if ( isVideoEnabled() ) {
		const displayNum = await getFreeDisplay();

		const { startFramebuffer, stopFramebuffer, takeScreenshot } = buildFramebufferHooks(
			displayNum
		);
		const { startVideoRecording, saveVideoRecording, stopVideoRecording } = buildVideoHooks(
			displayNum
		);

		// Used by driver-manager and video hooks
		global.displayNum = displayNum;

		// startVideo must come after startFramebuffer, as it depends on the framebuffer being up
		hooks.beforeAll = [ ...hooks.beforeAll, startFramebuffer, startVideoRecording ];
		hooks.afterEach = [ ...hooks.afterEach, takeScreenshot, saveVideoRecording ];
		hooks.afterAll = [ ...hooks.afterAll, stopFramebuffer, stopVideoRecording ];
	}

	hooks.afterAll = [ ...hooks.afterAll, saveBrowserLogs, closeBrowser ];
	hooks.beforeAll = [ ...hooks.beforeAll, createBrowser ];

	return hooks;
};
