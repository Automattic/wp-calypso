/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { get } from 'lodash';

function getCoBlocksMasonryExampleImages( settings, name ) {
	if ( 'coblocks/gallery-masonry' !== name ) {
		return settings;
	}

	return {
		...settings,
		example: {
			attributes: {
				...settings.attributes,
				images: [
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[0]' ) },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[1]' ) },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[2]' ) },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[3]' ) },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[4]' ) },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[5]' ) },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[6]' ) },
				],
			},
		},
	};
}

function getCoBlocksStackedExampleImages( settings, name ) {
	if ( 'coblocks/gallery-stacked' !== name ) {
		return settings;
	}

	return {
		...settings,
		example: {
			attributes: {
				...settings.attributes,
				images: [
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[5]' ) },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[1]' ) },
				],
			},
		},
	};
}

function getCoBlocksLogosExampleImages( settings, name ) {
	if ( 'coblocks/logos' !== name ) {
		return settings;
	}

	return {
		...settings,
		example: {
			attributes: {
				...settings.attributes,
				images: [
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[0]' ), width: 420 },
					{ url: get( 'wpcomGutenberg', 'coblocksGalleryImages[1]' ), width: 340 },
				],
			},
		},
	};
}

addFilter(
	'blocks.registerBlockType',
	'coblocks/gallery-masonry',
	getCoBlocksMasonryExampleImages
);

addFilter(
	'blocks.registerBlockType',
	'coblocks/gallery-stacked',
	getCoBlocksStackedExampleImages
);

addFilter( 'blocks.registerBlockType', 'coblocks/logos', getCoBlocksLogosExampleImages );
