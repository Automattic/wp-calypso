/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as videoRecorder from '../video-recorder';

const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );

export async function startVideoRecording() {
	this.timeout( afterHookTimeoutMS );

	await videoRecorder.startVideoRecording();
}

export async function saveVideoRecording() {
	this.timeout( afterHookTimeoutMS );

	if ( this.currentTest && this.currentTest.state === 'failed' ) {
		await videoRecorder.saveVideoRecording( this.currentTest );
	}
}

export async function stopVideoRecording() {
	this.timeout( afterHookTimeoutMS );

	await videoRecorder.stopVideoRecording();
}
