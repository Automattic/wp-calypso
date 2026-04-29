/**
 * Turn a tag name into a tag "slug" for use with the API. The result is *not*
 * URL-encoded; the api-core fetchers/mutators are responsible for encoding
 * path segments.
 */
export function slugify( tag: string ): string {
	return typeof tag === 'string'
		? tag.trim().toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' )
		: '';
}
