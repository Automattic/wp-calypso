/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { startVideoRecording, stopVideoRecording, saveVideoRecording } from './video-recorder';
import { saveBrowserLogs } from './browser-logs';
import { startFramebuffer, stopFramebuffer, takeScreenshot, getFreeDisplay } from './framebuffer';

const isVideoEnabled = () => {
	const video = config.has( 'useTestVideo' )
		? config.get( 'useTestVideo' )
		: process.env.TEST_VIDEO;
	return video === 'true';
};

export const mochaHooks = async () => {
	const hooks = {
		beforeAll: [],
		afterEach: [ saveBrowserLogs ],
		afterAll: [],
	};

	if ( isVideoEnabled() ) {
		const displayNum = await getFreeDisplay();
		// Used by driver-manager
		global.displayNum = displayNum;
		// startVideoRecording must come after startFramebuffer, as it depends on the framebuffer being up
		hooks.beforeAll = [
			...hooks.beforeAll,
			startFramebuffer( displayNum ),
			startVideoRecording( displayNum ),
		];
		hooks.afterEach = [ ...hooks.afterEach, takeScreenshot, saveVideoRecording ];
		hooks.afterAll = [ ...hooks.afterAll, stopFramebuffer, stopVideoRecording ];
	}

	return hooks;
};
