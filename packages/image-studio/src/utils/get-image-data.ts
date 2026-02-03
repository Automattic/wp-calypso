import { store as coreStore } from '@wordpress/core-data';
import { resolveSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { extractFilenameFromUrl } from './extract-filename';

/**
 * Image data returned by this function
 */
export interface ImageData {
	id: number;
	url: string;
	alt: string;
	title: string;
	caption: string;
	description: string;
	width: number;
	height: number;
	filename: string;
}

/**
 * WordPress media entity from core-data store
 */
interface WordPressMediaEntity {
	id: number;
	source_url: string;
	alt_text?: string;
	title?: {
		rendered: string;
		raw: string;
	};
	description?: {
		rendered: string;
		raw: string;
	};
	caption?: {
		rendered: string;
		raw: string;
	};
	media_details?: {
		width: number;
		height: number;
	};
}

/**
 * Fetches image attachment data from WordPress data store and transforms it
 * to the format expected by Image Studio.
 * Note: this could be placed in @utils/media.js as a getImageDataFromStore
 * function and reused in other places - however, it's being used by image studio (to be moved) so it's kept here for now.
 * @param attachmentId - The attachment ID to fetch.
 * @returns The transformed image data or null if not found/error.
 */
export async function getImageData( attachmentId: number ): Promise< ImageData | null > {
	try {
		const media = ( await resolveSelect( coreStore ).getEntityRecord(
			'postType',
			'attachment',
			attachmentId
		) ) as WordPressMediaEntity | null;

		if ( ! media ) {
			return null;
		}

		// Extract filename from URL
		const filename = extractFilenameFromUrl( media.source_url, __( 'Untitled', 'big-sky' ) );

		// Transform WordPress media entity to Image Studio format
		return {
			id: media.id,
			url: media.source_url,
			alt: media.alt_text || '',
			title: media.title?.raw || '',
			caption: media.caption?.raw || '',
			description: media.description?.raw || '',
			width: media.media_details?.width || 0,
			height: media.media_details?.height || 0,
			filename,
		};
	} catch ( error ) {
		window.console?.error?.( 'Error fetching image data:', error );
		return null;
	}
}
