import config from 'config';
import { buildHooks as buildFramebufferHooks, getFreeDisplay } from './framebuffer';
import { buildHooks as buildVideoHooks } from './video-recorder';

export const isVideoEnabled = () => {
	const video = config.has( 'useTestVideo' )
		? config.get( 'useTestVideo' )
		: process.env.TEST_VIDEO;
	return video === 'true';
};

export const buildHooks = () => {
	const displayNum = getFreeDisplay();

	const { startFramebuffer, stopFramebuffer, takeScreenshot } = buildFramebufferHooks( displayNum );
	const { startVideoRecording, saveVideoRecording, stopVideoRecording } = buildVideoHooks(
		displayNum
	);

	// Used by driver-manager
	global.displayNum = displayNum;

	return {
		startFramebuffer,
		stopFramebuffer,
		takeScreenshot,
		startVideoRecording,
		saveVideoRecording,
		stopVideoRecording,
	};
};
