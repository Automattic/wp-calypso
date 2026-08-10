type TracksProperties = Record< string, unknown >;

/**
 * A candidate site paired with the name of the resolution step that produced it, so
 * the winning step can be reported alongside the site itself.
 */
export type SiteCandidate = readonly [ source: string, siteId: unknown ];

export const NO_SITE_CONTEXT = 'none';

/**
 * Narrows a candidate site to a usable Tracks `blog_id`, rejecting the values that
 * reach analytics as "no site" in practice: 0, negatives, NaN, null and undefined.
 */
export function getValidBlogId( value: unknown ): number | undefined {
	const blogId = Number( value );

	return Number.isInteger( blogId ) && blogId > 0 ? blogId : undefined;
}

/**
 * Attaches the first usable site among `candidates` as `blog_id`, leaving every other
 * caller-supplied property untouched.
 *
 * Callers pass their candidates in priority order, most specific first. A `blog_id`
 * already present in `properties` is deliberately not treated as a candidate: it means
 * whatever the caller happened to put in the payload, which is not necessarily the site
 * the event is about, so surfaces that know their site should pass it explicitly.
 *
 * `site_context_source` names the step that supplied the site, or `none` when no
 * candidate was usable. Coverage of `blog_id` alone cannot tell a site that was known
 * from one that was guessed by a broad fallback, and those carry very different
 * confidence — reporting the source keeps that distinction measurable.
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
