/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { IMAGE_STUDIO_SUPPORTED_MIME_TYPES } from '../types';

/**
 * WordPress media entity from core-data store (minimal fields for listing)
 */
interface WordPressMediaEntityMinimal {
	id: number;
}

/**
 * Fetches a list of image attachment IDs from the WordPress media library.
 * Only returns images with supported MIME types for Image Studio (filtered server-side).
 * Results are ordered to match the Media Library's current sort order.
 *
 * Uses WordPress REST API's mime_type parameter with an array of supported types
 * for efficient server-side filtering instead of client-side filtering.
 * @param perPage - Number of results to fetch per page (default: 100).
 * @param page    - Page number to fetch (default: 1).
 * @returns Object containing array of attachment IDs and pagination metadata.
 */
export async function getMediaLibraryImages(
	perPage: number = 100,
	page: number = 1
): Promise< { ids: number[]; hasMore: boolean } > {
	try {
		// Try to match the Media Library's current sort order from URL params
		const urlParams = new URLSearchParams( window.location.search );
		const orderby = urlParams.get( 'orderby' ) || 'id';
		const order = urlParams.get( 'order' ) || 'desc';

		// Use apiFetch with parse: false to access response headers
		const path = addQueryArgs( '/wp/v2/media', {
			mime_type: IMAGE_STUDIO_SUPPORTED_MIME_TYPES,
			per_page: perPage,
			page,
			orderby,
			order,
			_fields: 'id',
		} );

		const response = ( await apiFetch( {
			path,
			parse: false,
		} ) ) as Response;
		const media = ( await response.json() ) as WordPressMediaEntityMinimal[];

		if ( ! media || ! Array.isArray( media ) ) {
			return { ids: [], hasMore: false };
		}

		const filteredIds = media.map( ( item ) => item.id );

		// Check X-WP-TotalPages header for accurate pagination
		const totalPages = response.headers.get( 'X-WP-TotalPages' );
		const hasMore = totalPages ? page < parseInt( totalPages, 10 ) : false;

		return { ids: filteredIds, hasMore };
	} catch ( error ) {
		window.console?.error?.( 'Error fetching media library images:', error );
		return { ids: [], hasMore: false };
	}
}
