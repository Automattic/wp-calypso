type TracksProperties = Record< string, unknown >;

export type SiteCandidate = readonly [ source: string, siteId: unknown ];

export const NO_SITE_CONTEXT = 'none';

export function getValidBlogId( value: unknown ): number | undefined {
	const blogId = Number( value );

	return Number.isInteger( blogId ) && blogId > 0 ? blogId : undefined;
}

/**
 * Attaches the first valid site in `candidates` (highest priority first) as `blog_id`, and
 * its label as `site_context_source`. A `blog_id` already in `properties` is dropped, not
 * used: it is whatever the caller put there, not necessarily the site the event is about.
 */
export function withSiteContext(
	properties: TracksProperties,
	candidates: readonly SiteCandidate[]
): TracksProperties {
	const eventProperties = { ...properties };
	const resolved = candidates.reduce< { source: string; blogId: number } | undefined >(
		( winner, [ source, siteId ] ) => {
			if ( winner ) {
				return winner;
			}
			const blogId = getValidBlogId( siteId );

			return blogId ? { source, blogId } : undefined;
		},
		undefined
	);

	delete eventProperties.blog_id;
	if ( resolved ) {
		eventProperties.blog_id = resolved.blogId;
	}
	eventProperties.site_context_source = resolved?.source ?? NO_SITE_CONTEXT;

	return eventProperties;
}
