import { forEach } from 'lodash';
import readerContentWidth from 'calypso/reader/lib/content-width';

export default function convertGalleryBlock( post, dom ) {
	// Regular expression to find the JSON data
	const regex = /<!--\s*wp:meow-gallery\/gallery\s*(.*?)\s*-->/;
	const matches = dom.innerHTML.match( regex );
	if ( matches && matches.length > 0 ) {
		// Extract the JSON data
		const jsonData = matches[ 1 ];

		if ( jsonData ) {
			// Parse the JSON data
			const parsedData = JSON.parse( jsonData );

			if ( parsedData && parsedData.images ) {
				// Extract images from parsed data
				const extractedImages = parsedData.images;
				console.log( 'Extracted images:', dom.innerHTML, extractedImages );

				// Loop through each image and create a new image element
				forEach( extractedImages, ( image ) => {
					const img = document.createElement( 'img' );
					img.src = image.url;
					img.width = image.width;
					img.height = image.height;
					img.alt = image.alt;
					img.title = image.title;
					//img.className = 'gallery-image';
					console.log( 'image', img );
					dom.appendChild( img );
				} );
			}
		}
	}
	return post;
}
