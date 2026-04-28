import { decodeEntities } from 'calypso/lib/formatting';
import type { ReadSingleTagResponse, ReadTagsResponse } from '@automattic/api-core';

export interface NormalizedReaderTag {
	id: string;
	slug: string;
	title: string;
	displayName: string;
	url: string;
	description?: string;
	isFollowing?: boolean;
	error?: boolean;
}

/**
 * Turn a tag name into a tag "slug" for use with the API.
 */
export function slugify( tag: string ): string {
	return typeof tag === 'string'
		? encodeURIComponent( tag.trim().toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' ) )
		: '';
}

/**
 * Normalize the WordPress.com `/read/tags` response (which can return either
 * a single tag or a list) to the canonical Calypso shape.
 */
export function normalizeTags(
	apiResponse: ReadSingleTagResponse | ReadTagsResponse
): NormalizedReaderTag[] {
	const single = ( apiResponse as ReadSingleTagResponse ).tag;
	const list = ( apiResponse as ReadTagsResponse ).tags;

	if ( ! single && ! list ) {
		throw new Error( `invalid tags response: ${ JSON.stringify( apiResponse ) }` );
	}

	const tags = [ single, ...( list ?? [] ) ].filter( Boolean ) as NonNullable< typeof single >[];

	return tags.map( ( tag ) => ( {
		id: String( tag.ID ),
		description: tag.description ? decodeEntities( tag.description ) : undefined,
		displayName: decodeEntities( tag.title || tag.display_name ),
		url: `/tag/${ tag.slug }`,
		title: decodeEntities( tag.title ),
		slug: tag.slug.toLowerCase(),
	} ) );
}
