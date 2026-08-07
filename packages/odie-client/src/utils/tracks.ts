type TracksProperties = Record< string, unknown >;

export function addOdieSiteContext(
	properties: TracksProperties,
	selectedSiteId: number | null | undefined
): TracksProperties {
	const blogId = Number( selectedSiteId );
	const eventProperties = { ...properties };

	delete eventProperties.blog_id;
	if ( Number.isInteger( blogId ) && blogId > 0 ) {
		eventProperties.blog_id = blogId;
	}

	return eventProperties;
}
