/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { get } from 'lodash';

const blocksToFilter = [ 'coblocks/masonry-gallery', 'coblocks/gallery-stacked', 'coblocks/logos' ];
const isSimpleSite = !! window.wpcomGutenberg.pluginVersion;

function updateUrl( url, version ) {
	let updatedPath;

	try {
		updatedPath = new URL( url ).pathname.replace( /coblocks\/dist/, `coblocks/${ version }/dist` );
	} catch ( e ) {
		return false;
	}

	return `https://s0.wp.com${ updatedPath }`;
}

function getCoBlocksExampleImages( settings, name ) {
	if (
		! blocksToFilter.includes( name ) ||
		! get( 'window', 'wpcomGutenberg', 'coblocksVersion' )
	) {
		return settings;
	}

	const images = settings.example.attributes.images.map( image => {
		return {
			...image,
			url: image.url ? updateUrl( image.url, window.wpcomGutenberg.coblocksVersion ) : false,
		};
	} );

	return {
		...settings,
		example: {
			...settings.example,
			attributes: {
				...settings.example.attributes,
				images,
			},
		},
	};
}

if ( isSimpleSite ) {
	addFilter( 'blocks.registerBlockType', 'coblocks/gallery-masonry', getCoBlocksExampleImages );
	addFilter( 'blocks.registerBlockType', 'coblocks/gallery-stacked', getCoBlocksExampleImages );
	addFilter( 'blocks.registerBlockType', 'coblocks/logos', getCoBlocksExampleImages );
}
