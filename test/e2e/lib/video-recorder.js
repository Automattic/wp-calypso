/**
 * External dependencies
 */
import config from 'config';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import ffmpeg from 'ffmpeg-static';

let file;
let xvfb;
let ffVideo;

function createDir( dir ) {
	dir = path.resolve( dir );
	if ( fs.existsSync( dir ) ) return dir;
	try {
		fs.mkdirSync( dir );
		return dir;
	} catch ( error ) {
		if ( error.code === 'ENOENT' ) {
			return createDir( path.dirname( dir ) ) && createDir( dir );
		}
		throw error;
	}
}

function isVideoEnabled() {
	const video = config.has( 'useTestVideo' )
		? config.get( 'useTestVideo' )
		: process.env.TEST_VIDEO;
	return video === 'true';
}

function getFreeDisplay() {
	let i = 99 + Math.round( Math.random() * 100 );
	while ( fs.existsSync( `/tmp/.X${ i }-lock` ) ) {
		i++;
	}
	global.displayNum = i;
}

export function startDisplay() {
	if ( ! isVideoEnabled() ) {
		return;
	}
	getFreeDisplay();
	xvfb = child_process.spawn( 'Xvfb', [
		'-ac',
		':' + global.displayNum,
		'-screen',
		'0',
		'1440x1000x24',
		'+extension',
		'RANDR',
	] );
}

export function stopDisplay() {
	if ( isVideoEnabled() && xvfb ) {
		xvfb.kill();
	}
}

export function startVideo() {
	if ( ! isVideoEnabled() ) {
		return;
	}
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const fileName = `${ global.displayNum }-${ dateTime }.mpg`;
	file = path.resolve( path.join( './screenshots/videos', fileName ) );
	createDir( path.dirname( file ) );
	ffVideo = child_process.spawn( ffmpeg.path, [
		'-f',
		'x11grab',
		'-video_size',
		'1440x1000',
		'-r',
		30,
		'-i',
		':' + global.displayNum,
		'-pix_fmt',
		'yuv420p',
		'-loglevel',
		'error',
		file,
	] );
}

export function stopVideo( currentTest = null ) {
	if ( ! isVideoEnabled() ) {
		return;
	}
	if ( currentTest && ffVideo ) {
		const currentTestName = currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
		const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
		const fileName = `${ currentTestName }-${ dateTime }.mpg`;
		const newFile = path.resolve( path.join( './screenshots/videos', fileName ) );
		ffVideo.kill();

		fs.rename( file, newFile, function ( err ) {
			if ( err ) {
				console.log( 'Screencast Video:' + file );
			}
			console.log( 'Screencast Video:' + newFile );
		} );
	} else if ( ffVideo && ! ffVideo.killed ) {
		ffVideo.kill();
		fs.unlink( file, function ( err ) {
			if ( err ) {
				console.log( 'Deleting of file for passed test failed.' );
			}
		} );
	}
}
