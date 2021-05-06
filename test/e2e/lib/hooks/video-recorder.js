/**
 * External dependencies
 */
import path from 'path';
import { rename, mkdir, unlink } from 'fs/promises';
import { createWriteStream } from 'fs';
import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { generatePath } from '../test-utils';

let file;
let ffVideo;

export const startVideoRecording = ( displayNum ) => async () => {
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	file = generatePath( `screenshots/${ dateTime }.mpg` );
	await mkdir( path.dirname( file ), { recursive: true } );

	const logging = createWriteStream( generatePath( 'ffmpeg.log' ), { flags: 'a' } );
	ffVideo = spawn( ffmpeg.path, [
		'-f',
		'x11grab',
		'-video_size',
		'1440x1000',
		'-r',
		30,
		'-i',
		`:${ displayNum }`,
		'-pix_fmt',
		'yuv420p',
		'-loglevel',
		'info',
		file,
	] );
	ffVideo.stdout.pipe( logging );
	ffVideo.stderr.pipe( logging );
};

export async function saveVideoRecording() {
	if ( ! this.currentTest || this.currentTest.state !== 'failed' ) {
		return;
	}

	const currentTestName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const newFile = generatePath( `screnshots/${ currentTestName }-${ dateTime }.mpg` );
	await rename( file, newFile );
}

export const stopVideoRecording = async () => {
	if ( ! ffVideo ) return;

	ffVideo.kill();
	try {
		await unlink( file );
	} catch ( e ) {
		// Not a big deal if we can't delete it
	}
};
