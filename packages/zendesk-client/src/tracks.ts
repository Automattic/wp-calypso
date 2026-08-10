type TracksProperties = Record< string, unknown >;

export function addZendeskSiteContext(
	properties: TracksProperties,
	siteId: number | string | null | undefined
): TracksProperties {
	const blogId = Number( siteId );
	const eventProperties = { ...properties };

	delete eventProperties.blog_id;
	if ( Number.isInteger( blogId ) && blogId > 0 ) {
		eventProperties.blog_id = blogId;
	}

	return eventProperties;
}
