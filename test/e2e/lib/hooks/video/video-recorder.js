import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { rename, mkdir, unlink } from 'fs/promises';
import path from 'path';
import ffmpeg from 'ffmpeg-static';
import { getTestNameWithTime } from '../../test-utils';

const kill = ( proc ) =>
	new Promise( ( resolve ) => {
		proc.on( 'close', resolve );
		proc.kill();
	} );

export const buildHooks = ( displayNum ) => {
	let file;
	let ffVideo;

	const startVideoRecording = async ( { tempDir } ) => {
		const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
		file = path.join( tempDir, `screenshots/${ displayNum }-${ dateTime }.mpg` );
		await mkdir( path.dirname( file ), { recursive: true } );

		const logging = createWriteStream( path.join( tempDir, 'ffmpeg.log' ), { flags: 'a' } );
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

	async function saveVideoRecording( { tempDir, testName } ) {
		const newFile = path.join( tempDir, `screenshots/${ getTestNameWithTime( testName ) }.mpg` );
		await mkdir( path.dirname( newFile ), { recursive: true } );
		await kill( ffVideo );
		await rename( file, newFile );
	}

	const stopVideoRecording = async () => {
		if ( ! ffVideo || ffVideo.killed ) return;
		await kill( ffVideo );
		await unlink( file );
	};

	return { startVideoRecording, saveVideoRecording, stopVideoRecording };
};
