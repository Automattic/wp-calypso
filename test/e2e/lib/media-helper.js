/**
 * External dependencies
 */
import fs from 'fs-extra';
import path from 'path';
import sanitize from 'sanitize-filename';
import pngitxt from 'png-itxt';
import { PassThrough } from 'stream';

export function createFile( notRandom, uploadDirectoryName = 'image-uploads' ) {
	let randomImageNumber = Math.floor( Math.random() * 2 );

	// If notRandom is set, always choose image 0 for visual comparison
	if ( notRandom ) {
		randomImageNumber = 0;
	}

	const originalImageName = 'image' + randomImageNumber;
	const originalFileName = `${ originalImageName }.jpg`;
	const originalFile = path.resolve(
		__dirname,
		`../${ uploadDirectoryName }/${ originalFileName }`
	);
	const newImageName = (
		'0000' + ( ( Math.random() * Math.pow( 36, 4 ) ) << 0 ).toString( 36 )
	).slice( -4 ); // random number
	const newFileName = `${ newImageName }.jpg`;
	const newFile = path.resolve( __dirname, `../${ uploadDirectoryName }/${ newFileName }` );
	fs.copySync( originalFile, newFile );

	return {
		imageName: newImageName,
		fileName: newFileName,
		file: newFile,
	};
}

export function getMP3FileWithFilename( filename ) {
	const originalFileName = 'bees.mp3';
	const originalFile = path.resolve( __dirname, `../image-uploads/${ originalFileName }` );
	const newFile = path.resolve( __dirname, '../image-uploads/' + filename );
	fs.copySync( originalFile, newFile );

	return {
		imageName: filename,
		fileName: filename,
		file: newFile,
	};
}

export function createFileWithFilename( filename, skipNameCheck ) {
	if ( ! skipNameCheck && sanitize( filename ) !== filename ) {
		throw new Error( `Invalid filename given ${ filename }` );
	}

	const originalFileName = 'image0.jpg';
	const originalFile = path.resolve( __dirname, `../image-uploads/${ originalFileName }` );
	const newFile = path.resolve( __dirname, '../image-uploads/' + filename );
	fs.copySync( originalFile, newFile );

	return {
		imageName: filename,
		fileName: filename,
		file: newFile,
	};
}

export function deleteFile( fileDetails ) {
	return fs.deleteSync( fileDetails.file );
}

export const screenshotsDir = path.resolve(
	process.env.TEMP_ASSET_PATH || __dirname + '/..',
	process.env.SCREENSHOTDIR || 'screenshots'
);

export function writeScreenshot( data, filenameCallback, metadata ) {
	const buffer = Buffer.from( data, 'base64' );
	let filename;
	let pt = new PassThrough();

	if ( ! fs.existsSync( screenshotsDir ) ) {
		fs.mkdirSync( screenshotsDir );
	}

	console.debug( '**** writeScreenshot.screenshotDir =', screenshotsDir );

	if ( typeof filenameCallback === 'function' ) {
		filename = filenameCallback();
	} else {
		filename = new Date().getTime().toString();
	}
	const screenshotPath = `${ screenshotsDir }/${ filename }.png`;

	console.debug( '**** writeScreenshot.screenshotPath =', screenshotPath );
	if ( typeof metadata === 'object' ) {
		for ( const i in metadata ) {
			pt = pt.pipe( pngitxt.set( i, metadata[ i ] ) );
		}
	}
	pt.pipe( fs.createWriteStream( screenshotPath ) );
	return pt.end( buffer, 'buffer' );
}

export function writeTextLogFile( textContent, prefix, pathOverride ) {
	if ( prefix === undefined ) {
		prefix = '';
	}
	const directoryName = pathOverride || '../logs';
	const logDir = path.resolve( __dirname, directoryName );
	if ( ! fs.existsSync( logDir ) ) {
		fs.mkdirSync( logDir );
	}
	const dateString = new Date().getTime().toString();
	const fileName = `${ dateString }-${ prefix }-log.txt`;
	const logPath = `${ logDir }/${ fileName }`;
	fs.writeFileSync( logPath, textContent );

	return logPath;
}
