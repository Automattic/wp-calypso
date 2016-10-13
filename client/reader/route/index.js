const FEED_URL_BASE = '/read/feeds/';
const SITE_URL_BASE = '/read/blogs/';

const PRETTY_FEED_URLS = {
	12733228: '/discover'
};

const PRETTY_SITE_URLS = {
	53424024: '/discover'
};

export function getPrettySiteUrl( siteID ) {
	return PRETTY_SITE_URLS[ siteID ];
}

export function getPrettyFeedUrl( feedID ) {
	return PRETTY_FEED_URLS[ feedID ];
}

export function getSiteUrl( siteID ) {
	return getPrettySiteUrl( siteID ) || SITE_URL_BASE + siteID;
}

export function getFeedUrl( feedID ) {
	return getPrettyFeedUrl( feedID ) || FEED_URL_BASE + feedID;
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

export function getPostUrl( post ) {
	if ( post.feed_ID && post.feed_item_ID ) {
		return `/read/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }`;
	} else if ( post.is_external ) {
		return `/read/feeds/${ post.feed_ID }/posts/${ post.ID }`;
	}
	return `/read/blogs/${ post.site_ID }/posts/${ post.ID }`;
}
