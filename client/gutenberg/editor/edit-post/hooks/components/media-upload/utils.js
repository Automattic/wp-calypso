/** @format */
/**
 * External dependencies
 */
import { get, reduce } from 'lodash';

/**
 * Convert the Calypso Media Modal output to the format expected by Gutenberg
 * @param {Object} media Calypso media modal output
 *
 * @returns {Array|Object} Gutenberg media blocks input
 */
export const mediaCalypsoToGutenberg = media => {
	return {
		id: get( media, 'ID' ),
		url: get( media, 'URL' ),
		alt: get( media, 'alt' ),
		caption: get( media, 'caption' ),
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
		width: get( media, 'width' ),
	};
};
