/* eslint-disable import/no-nodejs-modules */
/* eslint-disable jsdoc/check-tag-names */
/** @format */

/**
 * External dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );
const child_process = require( 'child_process' );
const ffmpeg = require( 'ffmpeg-static' );

const E2E_DIR = path.resolve( __dirname, '../../' );

let file;
let ffVideo;

exports.createDir = function ( dir ) {
	dir = path.resolve( dir );
	if ( fs.existsSync( dir ) ) return dir;
	try {
		fs.mkdirSync( dir );
		return dir;
	} catch ( error ) {
		if ( error.code === 'ENOENT' ) {
			return this.createDir( path.dirname( dir ) ) && this.createDir( dir );
		}
		throw error;
	}
};

exports.isVideoEnabled = function () {
	const video = process.env.CI;
	return video === 'true';
};

exports.startVideo = function () {
	if ( ! this.isVideoEnabled() ) {
		return;
	}
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const fileName = `e2e-test-run-${ dateTime }.mpg`;
	file = path.join( E2E_DIR, 'screenshots', 'videos', fileName );
	this.createDir( path.dirname( file ) );
	ffVideo = child_process.spawn(
		ffmpeg.path,
		[
			'-f',
			'avfoundation',
			'-video_size',
			'1440x1000',
			'-r',
			30,
			'-i',
			'0:none',
			'-pix_fmt',
			'yuv420p',
			'-loglevel',
			'error',
			file,
		],
		{
			stdio: 'inherit',
		}
	);
};

exports.stopVideo = function () {
	if ( ! this.isVideoEnabled() ) {
		return;
	}
	if ( ffVideo && ! ffVideo.killed ) {
		ffVideo.kill();
	}
};
