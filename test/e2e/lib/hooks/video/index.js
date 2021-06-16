/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { buildHooks as buildVideoHooks } from './video-recorder';
import { buildHooks as buildFramebufferHooks, getFreeDisplay } from './framebuffer';

export const isVideoEnabled = () => {
	const video = config.has( 'useTestVideo' )
		? config.get( 'useTestVideo' )
		: process.env.TEST_VIDEO;
	return video === 'true';
};

export const buildHooks = () => {
	if ( ! isVideoEnabled() ) {
		return {
			afterAll: [],
			beforeAll: [],
			afterEach: [],
		};
	}
	const displayNum = getFreeDisplay();

	const { startFramebuffer, stopFramebuffer, takeScreenshot } = buildFramebufferHooks( displayNum );
	const { startVideoRecording, saveVideoRecording, stopVideoRecording } = buildVideoHooks(
		displayNum
	);

	// Used by driver-manager and video hooks
	global.displayNum = displayNum;

	// startVideoRecording must come after startFramebuffer, as it depends on the framebuffer being up
	return {
		afterAll: [ stopFramebuffer, stopVideoRecording ],
		beforeAll: [ startFramebuffer, startVideoRecording ],
		afterEach: [ takeScreenshot, saveVideoRecording ],
	};
};
