const videoRecorder = require( './video-recorder' );

// Start recording
before( async function () {
	await videoRecorder.startVideo();
} );

// Stop video
after( async function () {
	await videoRecorder.stopVideo();
} );
