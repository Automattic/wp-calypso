/**
 * External dependencies
 */
import { get, head, includes, isArray, reduce, split } from 'lodash';

/**
 * WordPress dependencies
 */
import { parseWithAttributeSchema } from '@wordpress/blocks';

/**
 * Convert the Calypso Media Modal output to the format expected by Gutenberg
 *
 * @param {object} media Calypso media modal output
 *
 * @returns {Array|object} Gutenberg media blocks input
 */
export const mediaCalypsoToGutenberg = ( media ) => {
	return {
		id: get( media, 'ID' ),
		url: get( media, 'URL' ),
		alt: get( media, 'alt' ),
		// TODO: replace with `{ source: 'rich-text' }` after updating Gutenberg
		caption: !! media.caption
			? parseWithAttributeSchema( media.caption, { source: 'children' } )
			: '',
		description: get( media, 'description' ),
		filename: get( media, 'file' ),
		height: get( media, 'height' ),
		icon: get( media, 'icon' ),
		mime: get( media, 'mime_type' ),
		sizes: {
			full: {
				url: get( media, 'URL' ),
			},
			...reduce(
				media.thumbnails,
				( thumbnails, url, size ) => {
					thumbnails[ size ] = { url };
					return thumbnails;
				},
				{}
			),
		},
		title: get( media, 'title' ),
		type: head( split( get( media, 'mime_type', '' ), '/' ) ),
		width: get( media, 'width' ),
	};
};

export const getDisabledDataSources = ( allowedTypes ) => {
	// Additional data sources are enabled for all blocks supporting images.
	// The File block supports images, but doesn't explicitly allow any media type:
	// its `allowedTypes` prop can be either undefined or an empty array.
	if (
		! allowedTypes ||
		( isArray( allowedTypes ) && ! allowedTypes.length ) ||
		includes( allowedTypes, 'image' )
	) {
		return [];
	}
	return [ 'google_photos', 'pexels' ];
};

const enabledFiltersMap = {
	image: 'images',
	audio: 'audio',
	video: 'videos',
};

export const getEnabledFilters = ( allowedTypes ) => {
	return isArray( allowedTypes ) && allowedTypes.length
		? allowedTypes.map( ( type ) => enabledFiltersMap[ type ] )
		: undefined;
};
