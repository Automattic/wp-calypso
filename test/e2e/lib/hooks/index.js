/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { startVideoRecording, stopVideoRecording, saveVideoRecording } from './video-recorder';
import { saveBrowserLogs } from './browser-logs';
import { startFramebuffer, stopFramebuffer, takeScreenshot } from './framebuffer';

const isVideoEnabled = () => {
	const video = config.has( 'useTestVideo' )
		? config.get( 'useTestVideo' )
		: process.env.TEST_VIDEO;
	return video === 'true';
};

export const mochaHooks = () => {
	const hooks = {
		beforeAll: [],
		afterEach: [ saveBrowserLogs ],
		afterAll: [],
	};

	if ( isVideoEnabled() ) {
		hooks.beforeAll = [ ...hooks.beforeAll, startFramebuffer, startVideoRecording ];
		hooks.afterEach = [ ...hooks.afterEach, takeScreenshot, saveVideoRecording ];
		hooks.afterAll = [ ...hooks.afterAll, stopFramebuffer, stopVideoRecording ];
	}

	return hooks;
};
