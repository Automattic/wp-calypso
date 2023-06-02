import { parseWithAttributeSchema } from '@wordpress/blocks';
import { get, includes, reduce } from 'lodash';

const EMPTY_ARRAY = [];
const DEFAULT_DISABLED_DATA_SOURCES = [ 'google_photos', 'openverse', 'pexels' ];

/**
 * Convert the Calypso Media Modal output to the format expected by Gutenberg
 *
 * @param {Object} media Calypso media modal output
 * @returns {Array | Object} Gutenberg media blocks input
 */
export const mediaCalypsoToGutenberg = ( media ) => {
	const mediaData = {
		id: get( media, 'ID' ),
		url: get( media, 'URL' ),
		alt: get( media, 'alt' ),
		// TODO: replace with `{ source: 'rich-text' }` after updating Gutenberg
		caption: media.caption ? parseWithAttributeSchema( media.caption, { source: 'children' } ) : '',
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
		type: get( media, 'mime_type', '' ).split( '/' )[ 0 ],
		width: get( media, 'width' ),
	};

	// VideoPress data
	if ( media.videopress_guid ) {
		mediaData.allow_download = media.allow_download;
		mediaData.rating = media.rating;
		mediaData.videopress_guid = media.videopress_guid;
	}

	return mediaData;
};

export const getDisabledDataSources = ( allowedTypes ) => {
	// Additional data sources are enabled for all blocks supporting images.
	// The File block supports images, but doesn't explicitly allow any media type:
	// its `allowedTypes` prop can be either undefined or an empty array.
	if (
		! allowedTypes ||
		( Array.isArray( allowedTypes ) && ! allowedTypes.length ) ||
		includes( allowedTypes, 'image' )
	) {
		return EMPTY_ARRAY;
	}
	return DEFAULT_DISABLED_DATA_SOURCES;
};

const enabledFiltersMap = {
	image: 'images',
	audio: 'audio',
	video: 'videos',
};

export const getEnabledFilters = ( allowedTypes ) => {
	return Array.isArray( allowedTypes ) && allowedTypes.length
		? allowedTypes.map( ( type ) => enabledFiltersMap[ type ] )
		: undefined;
};
