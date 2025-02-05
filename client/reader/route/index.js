const FEED_URL_BASE = '/reader/feeds/';
const SITE_URL_BASE = '/reader/blogs/';

export function getSiteUrl( siteID ) {
	return SITE_URL_BASE + siteID;
}

export function getFeedUrl( feedID ) {
	return FEED_URL_BASE + feedID;
}

export function getStreamUrl( feedID, siteID ) {
	if ( feedID ) {
		return getFeedUrl( feedID );
	}

	return getSiteUrl( siteID );
}

export function getStreamUrlFromPost( post ) {
	if ( post.feed_ID ) {
		return getFeedUrl( post.feed_ID );
	}

	return getSiteUrl( post.site_ID );
}

export function getTagStreamUrl( tag ) {
	return `/tag/${ tag }`;
}

export function getPostUrl( post ) {
	if ( post.feed_ID && post.feed_item_ID ) {
		return `/reader/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }`;
	} else if ( post.is_external ) {
		return `/reader/feeds/${ post.feed_ID }/posts/${ post.ID }`;
	}
	return `/reader/blogs/${ post.site_ID }/posts/${ post.ID }`;
}
