/**
 * Internal dependencies
 */
import * as videoRecorder from '../video-recorder';

export const startVideo = async function () {
	await videoRecorder.startDisplay();
	await videoRecorder.startVideo();
};

export const takeScreenshot = async function () {
	if ( this.currentTest && this.currentTest.state === 'failed' ) {
		await videoRecorder.takeScreenshot( this.currentTest );
	}
};

export const stopVideo = async function () {
	await videoRecorder.stopVideo();
	await videoRecorder.stopDisplay();
};
