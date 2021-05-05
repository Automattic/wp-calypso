/**
 * External dependencies
 */
import fs from 'fs-extra';
import path from 'path';
import sanitize from 'sanitize-filename';
import pngitxt from 'png-itxt';
import { pipeline } from 'stream';
import { createWriteStream, mkdir } from 'fs/promises';
import { promisify } from 'util';

export const screenshotsDir = path.resolve(
	process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' ),
	process.env.SCREENSHOTDIR || 'screenshots'
);

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

export async function takeScreenshot( currentTest ) {
	const currentTestName = currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const fileName = path.resolve(
		path.join( screenshotsDir, `${ currentTestName }-${ dateTime }.png` )
	);
	await mkdir( path.dirname( fileName ), { recursive: true } );

	const driver = global.__BROWSER__;
	const screenshotData = await driver.takeScreenshot();
	const url = await driver.getCurrentUrl();

	return promisify( pipeline )(
		screenshotData,
		pngitxt.set( 'url', url ),
		createWriteStream( fileName )
	);
}
