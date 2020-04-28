/* eslint-disable import/no-extraneous-dependencies */
/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * NHA dependencies
 */
import { settings as carouselSettings } from './synced-newspack-blocks/blocks/carousel/index';

/**
 * Block name in the A8C\FSE context.
 */
const postsCarouselName = 'a8c/posts-carousel';

function setBlockTransformationName( name ) {
	if ( name === 'newspack-blocks/carousel' ) {
		return postsCarouselName;
	}
	return name;
}

addFilter(
	'blocks.transforms_from_name',
	'set-transformed-block-name',
	setBlockTransformationName
);

registerBlockType( postsCarouselName, {
	...carouselSettings,
	title: __( 'Posts Carousel', 'full-site-editing' ),
	category: 'layout'
} );
