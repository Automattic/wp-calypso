/**
 * External dependencies
 */
import path from 'path';
import { rename, mkdir, unlink } from 'fs/promises';
import child_process from 'child_process';
import ffmpeg from 'ffmpeg-static';

let file;
let ffVideo;

export async function startVideoRecording() {
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const fileName = `${ dateTime }.mpg`;
	file = path.resolve( path.join( './screenshots/videos', fileName ) );
	await mkdir( path.dirname( file ), { recursive: true } );
	ffVideo = child_process.spawn( ffmpeg.path, [
		'-f',
		'x11grab',
		'-video_size',
		'1440x1000',
		'-r',
		30,
		'-i',
		process.env.DISPLAY,
		'-pix_fmt',
		'yuv420p',
		'-loglevel',
		'error',
		file,
	] );
}

export async function saveVideoRecording() {
	if ( ! this.currentTest || this.currentTest.state !== 'failed' ) {
		return;
	}

	const currentTestName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const fileName = `${ currentTestName }-${ dateTime }.mpg`;
	const newFile = path.resolve( path.join( './screenshots/videos', fileName ) );
	await rename( file, newFile );
}

export async function stopVideoRecording() {
	if ( ! ffVideo ) return;

	ffVideo.kill();
	try {
		await unlink( file );
	} catch ( e ) {
		// Not a big deal if we can't delete it
	}
}
