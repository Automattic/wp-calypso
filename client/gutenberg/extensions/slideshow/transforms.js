/**
 * External dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { filter } from 'lodash';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/gallery', 'jetpack/tiled-gallery' ],
			transform: attributes => {
				const validImages = filter( attributes.images, ( { id, url } ) => id && url );
				if ( validImages.length > 0 ) {
					return createBlock( 'jetpack/slideshow', {
						images: validImages.map( ( { id, url, alt, caption } ) => ( {
							id,
							url,
							alt,
							caption,
						} ) ),
					} );
				}
				return createBlock( 'jetpack/slideshow' );
			},
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/gallery' ],
			transform: ( { images } ) => createBlock( 'core/gallery', { images } ),
		},
		{
			type: 'block',
			blocks: [ 'jetpack/tiled-gallery' ],
			transform: ( { images } ) => createBlock( 'jetpack/tiled-gallery', { images }, [] ),
		},
		{
			type: 'block',
			blocks: [ 'core/image' ],
			transform: ( { images } ) => {
				if ( images.length > 0 ) {
					return images.map( ( { id, url, alt, caption } ) =>
						createBlock( 'core/image', { id, url, alt, caption } )
					);
				}
				return createBlock( 'core/image' );
			},
		},
	],
};

export default transforms;
