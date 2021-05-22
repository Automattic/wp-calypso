/**
 * External dependencies
 */
import path from 'path';
import { rename, mkdir, unlink } from 'fs/promises';
import { createWriteStream } from 'fs';
import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { generatePath, getTestNameWithTime } from '../test-utils';

const kill = ( proc ) =>
	new Promise( ( resolve ) => {
		proc.on( 'close', resolve );
		proc.kill();
	} );

export const buildHooks = ( displayNum ) => {
	let file;
	let ffVideo;

	const startVideoRecording = async () => {
		console.log( `Start video recording on port :${ displayNum }}` );
		const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
		file = generatePath( `screenshots/${ displayNum }-${ dateTime }.mpg` );
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

	async function saveVideoRecording() {
		if ( ! this.currentTest || this.currentTest.state !== 'failed' ) {
			return;
		}

		try {
			const newFile = generatePath(
				`screenshots/${ getTestNameWithTime( this.currentTest ) }.mpg`
			);
			await mkdir( path.dirname( newFile ), { recursive: true } );
			await kill( ffVideo );
			await rename( file, newFile );
		} catch ( err ) {
			console.warn(
				'Got an error trying to save the recorded video. This IS NOT causing the test to break, is just a warning'
			);
			console.warn( 'Original error:' );
			console.warn( err );
		}
	}

	const stopVideoRecording = async () => {
		if ( ! ffVideo || ffVideo.killed ) return;

		try {
			await kill( ffVideo );
			await unlink( file );
		} catch ( err ) {
			console.warn(
				'Got an error trying to clean up the recorded video. This IS NOT causing the test to break, is just a warning'
			);
			console.warn( 'Original error:' );
			console.warn( err );
		}
	};

	return { startVideoRecording, saveVideoRecording, stopVideoRecording };
};
