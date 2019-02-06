/** @format */

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

	let originalImageName = 'image' + randomImageNumber;
	let originalFileName = `${ originalImageName }.jpg`;
	let originalFile = path.resolve( __dirname, `../${ uploadDirectoryName }/${ originalFileName }` );
	let newImageName = (
		'0000' + ( ( Math.random() * Math.pow( 36, 4 ) ) << 0 ).toString( 36 )
	).slice( -4 ); // random number
	let newFileName = `${ newImageName }.jpg`;
	let newFile = path.resolve( __dirname, `../${ uploadDirectoryName }/${ newFileName }` );
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

export function writeScreenshot( data, filenameCallback, metadata ) {
	const buffer = Buffer.from( data, 'base64' );
	let filename;
	let pt = new PassThrough();

	let screenShotBase = __dirname + '/..';
	if ( process.env.TEMP_ASSET_PATH ) {
		screenShotBase = process.env.TEMP_ASSET_PATH;
	}

	let directoryName = 'screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		directoryName = process.env.SCREENSHOTDIR;
	}

	const screenShotDir = path.resolve( screenShotBase, directoryName );
	if ( ! fs.existsSync( screenShotDir ) ) {
		fs.mkdirSync( screenShotDir );
	}

	if ( typeof filenameCallback === 'function' ) {
		filename = filenameCallback();
	} else {
		filename = new Date().getTime().toString();
	}
	const screenshotPath = `${ screenShotDir }/${ filename }.png`;
	if ( typeof metadata === 'object' ) {
		for ( let i in metadata ) {
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
	let directoryName = pathOverride || '../logs';
	let logDir = path.resolve( __dirname, directoryName );
	if ( ! fs.existsSync( logDir ) ) {
		fs.mkdirSync( logDir );
	}
	let dateString = new Date().getTime().toString();
	let fileName = `${ dateString }-${ prefix }-log.txt`;
	let logPath = `${ logDir }/${ fileName }`;
	fs.writeFileSync( logPath, textContent );

	return logPath;
}
