/**
 * External dependencies
 */
import loadImage from 'blueimp-load-image';
import assign from 'lodash/assign';

/**
 * @returns { int } Orientation of the image
 *
 * @param { File } file --  The `window.File` object representing the image
 */
export function getImageOrientation( file ) {
  return new Promise ( resolve => {
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
};

/**
 * Change the orientation of an image
 *
 * @returns { Blob } Blob containing the re-orientated image
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
        res => {
          if ( 'error' === res.type ) {
            reject( new Error( 'Unable to change image orientation' ) );
          } else {
            res.toBlob( blob => resolve( blob ) );
          }
        },
        assign( { orientation: orientation }, options )
      );
  } );
};
