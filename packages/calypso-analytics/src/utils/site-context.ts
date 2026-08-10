type TracksProperties = Record< string, unknown >;

/**
 * Narrows a candidate site to a usable Tracks `blog_id`, rejecting the values that
 * reach analytics as "no site" in practice: 0, negatives, NaN, null and undefined.
 */
export function getValidBlogId( value: unknown ): number | undefined {
	const blogId = Number( value );

	return Number.isInteger( blogId ) && blogId > 0 ? blogId : undefined;
}

/**
 * Attaches the first usable site among `candidateSiteIds` as `blog_id`, leaving every
 * other caller-supplied property untouched.
 *
 * Callers pass their candidates in priority order, most specific first. A `blog_id`
 * already present in `properties` is deliberately not treated as a candidate: it means
 * whatever the caller happened to put in the payload, which is not necessarily the site
 * the event is about, so surfaces that know their site should pass it explicitly.
 */
export function withSiteContext(
	properties: TracksProperties,
	...candidateSiteIds: unknown[]
): TracksProperties {
	const eventProperties = { ...properties };
	const blogId = candidateSiteIds.reduce< number | undefined >(
		( resolved, candidate ) => resolved ?? getValidBlogId( candidate ),
		undefined
	);

	delete eventProperties.blog_id;
	if ( blogId ) {
		eventProperties.blog_id = blogId;
	}

	return eventProperties;
}
