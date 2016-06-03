/**
 * External Dependencies
 */
import filter from 'lodash/filter';
import find from 'lodash/find';
import flow from 'lodash/flow';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import pick from 'lodash/pick';
import pull from 'lodash/pull';
import uniq from 'lodash/uniq';

/**
 * Internal Dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:post-normalizer:wait-for-images-to-load' );

function convertImageToObject( image ) {
	return pick( image, [ 'src', 'naturalWidth', 'naturalHeight' ] );
}

function imageForURL( imageUrl ) {
	var img = new Image();
	img.src = imageUrl;
	return img;
}

function promiseForImage( image ) {
	if ( image.complete && image.naturalWidth > 0 ) {
		return Promise.resolve( image );
	}
	return new Promise( ( resolve, reject ) => {
		image.onload = () => resolve( image );
		image.onerror = () => reject( image );
	} );
}

const promiseForURL = flow( imageForURL, promiseForImage );

export default function waitForImagesToLoad( post ) {
	return new Promise( ( resolve ) => {
		function acceptLoadedImages( images ) {
			post.images = map( images, convertImageToObject );

			post.content_images = filter( map( post.content_images, function( image ) {
				return find( post.images, { src: image.src } );
			} ), Boolean );

			resolve( post );
		}

		let imagesToCheck = [];

		if ( post.featured_image ) {
			imagesToCheck.push( post.featured_image );
		}

		forEach( post.content_images, function( image ) {
			imagesToCheck.push( image.src );
		} );

		if ( imagesToCheck.length === 0 ) {
			resolve( post );
			return;
		}

		// dedupe the set of images
		imagesToCheck = uniq( imagesToCheck );

		// convert to image objects to start the load process
		let promises = map( imagesToCheck, promiseForURL );

		const imagesLoaded = {};

		forEach( promises, promise => {
			promise.then( image => {
				// keep track of what loaded successfully. Note these will be out of order.
				imagesLoaded[ image.src ] = image;
			} ).catch( err => {
				// ignore what did not, but return the promise chain to success
				debug( 'failed to load image', err, post );
				return null;
			} ).then( () => {
				// check to see if all of the promises have settled
				// if so, accept what loaded and resolve the main promise
				promises = pull( promises, promise );
				if ( promises.length === 0 ) {
					const imagesInOrder = filter( map( imagesToCheck, src => {
						return imagesLoaded[ src ];
					} ), Boolean );
					acceptLoadedImages( imagesInOrder );
				}
			} ).catch( err => {
				debug( 'Fulfilling promise failed', err );
			} );
		} );
	} );
}
