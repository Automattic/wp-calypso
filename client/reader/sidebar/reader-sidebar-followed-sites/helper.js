export const getFollowedSitePath = ( site ) => {
	if ( site.feed_ID ) {
		return `/read/feeds/${ site.feed_ID }`;
	}

	if ( site.blog_ID ) {
		// If subscription is missing a feed ID, fallback to blog stream
		return `/read/blogs/${ site.blog_ID }`;
	}

	// Skip it
	return null;
};
