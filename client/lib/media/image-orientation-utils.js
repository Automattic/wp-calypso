/**
 * External dependencies
 */
import loadImage from 'blueimp-load-image';
import 'blueimp-canvas-to-blob';

/**
 * @returns { int } Orientation of the image
 *
 * @param { File } file --  The `window.File` object representing the image
 */
export function getImageOrientation( file ) {
	return new Promise( resolve => {
		loadImage.parseMetaData( file, data => {
			resolve( data.exif ? data.exif.get( 'Orientation' ) : -1 );
		}, {
			// Save on computation by disabling the following Exif properties
			// (Although technically all Exif data is stored in the first 256 KiB,
			// so it's really not that *big* of a deal)
			disableExifThumbnail: true,
			disableExifSub: true,
			disableExifGps: true
		} );
	} );
}

/**
 * Change the orientation of an image to the specified value
 *
 * @returns { string } Blob URL pointing to the re-oriented image
 *
 * @param { string } url --  The image URL
 * @param { int } orientation -- Desired orientation
 * @param { object } options -- List of options available here:
 *    https://github.com/blueimp/JavaScript-Load-Image#options
 */
export function changeImageOrientation( url, orientation, options = {} ) {
	return new Promise( ( resolve, reject ) => {
		loadImage(
			url,
			result => {
				if ( 'error' === result.type ) {
					reject( new Error( 'Unable to change image orientation' ) );
				} else {
					result.toBlob( blob => resolve( blob ) );
				}
			},
			Object.assign( { orientation }, options )
		);
	} );
}

/**
 * Fixes the image orientation to be the "up" position
 *
 * @returns { string } Blob URL pointing to the re-oriented image
 *
 * @param { object } file --  The image file
 * @param { object } options -- List of options available here:
 *    https://github.com/blueimp/JavaScript-Load-Image#options
 */
export function fixImageOrientation( file, options = {} ) {
	return getImageOrientation( file )
		.then( orientation => {
			// If the orientation is <= 1 (where 1 is "top", and anything less
			// than that means there was no Exif data), then no further orientation
			// changes are necessary.
			if ( 1 >= orientation ) {
				return loadImage.createObjectURL( file );
			}

			return changeImageOrientation( file, orientation, options )
				.then( blob => loadImage.createObjectURL( blob ) )
				.catch( () => loadImage.createObjectURL( file ) );
		} );
}
