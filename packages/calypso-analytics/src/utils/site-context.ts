type TracksProperties = Record< string, unknown >;

export const NO_SITE_CONTEXT = 'none';

export function getValidBlogId( value: unknown ): number | undefined {
	const blogId = Number( value );

	return Number.isInteger( blogId ) && blogId > 0 ? blogId : undefined;
}

/**
 * Attaches `siteId` as `blog_id` and `source` as `site_context_source`. When `siteId` is
 * not a valid blog id, the event carries no `blog_id` and reports `site_context_source`
 * as `none` instead. A `blog_id` already in `properties` is dropped, not used: it is
 * whatever the caller put there, not necessarily the site the event is about.
 *
 * `force_site_id` is dropped along with it when no site resolves. It only has an effect
 * when no explicit `blog_id` is present, and there it tells Calypso's super props to fall
 * back to the selected site — which would contradict a `site_context_source` of `none`.
 */
export function withSiteContext(
	properties: TracksProperties,
	source: string,
	siteId?: unknown
): TracksProperties {
	const eventProperties = { ...properties };
	const blogId = getValidBlogId( siteId );

	delete eventProperties.blog_id;
	if ( blogId ) {
		eventProperties.blog_id = blogId;
		eventProperties.site_context_source = source;
	} else {
		delete eventProperties.force_site_id;
		eventProperties.site_context_source = NO_SITE_CONTEXT;
	}

	return eventProperties;
}
