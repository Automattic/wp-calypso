const child_process = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const ffmpeg = require( 'ffmpeg-static' );

const E2E_DIR = path.resolve( __dirname, '../../' );

let file;
let ffVideo;
let ffDisplay;
let ffFileExt;
let ffFramework;
let ffVideoSize;

switch ( process.platform ) {
	case 'darwin':
		ffDisplay = '0:none';
		ffVideoSize = '1440x1000';
		ffFramework = 'avfoundation';
		ffFileExt = 'mpg';
		break;
	case 'linux':
		ffDisplay = `:99`;
		ffVideoSize = '1280x1024';
		ffFramework = 'x11grab';
		ffFileExt = 'mp4';
		break;
	default:
		throw 'unsupported platform!';
}

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
	const fileName = `e2e-test-run-${ dateTime }.${ ffFileExt }`;
	file = path.join( E2E_DIR, 'screenshots', 'videos', fileName );
	this.createDir( path.dirname( file ) );
	const logging = fs.createWriteStream(
		path.join( E2E_DIR, 'screenshots', 'videos', 'ffmpeg.log' ),
		{
			flags: 'a',
		}
	);

	ffVideo = child_process.spawn( ffmpeg.path, [
		'-f',
		ffFramework,
		'-video_size',
		ffVideoSize,
		'-r',
		30,
		'-i',
		ffDisplay,
		'-pix_fmt',
		'yuv420p',
		'-loglevel',
		'info',
		file,
	] );
	ffVideo.stdout.pipe( logging );
	ffVideo.stderr.pipe( logging );
};

exports.stopVideo = function () {
	if ( ! this.isVideoEnabled() ) {
		return;
	}
	if ( ffVideo && ! ffVideo.killed ) {
		ffVideo.kill();
	}
};
