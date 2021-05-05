/**
 * External dependencies
 */
import fs from 'fs-extra';
import path from 'path';
import sanitize from 'sanitize-filename';

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
