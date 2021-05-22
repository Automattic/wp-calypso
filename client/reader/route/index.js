/**
 * Internal dependencies
 */

import config from '@automattic/calypso-config';

const FEED_URL_BASE = '/read/feeds/';
const SITE_URL_BASE = '/read/blogs/';

const DISCOVER_SITE_ID = config( 'discover_blog_id' );
const DISCOVER_FEED_ID = config( 'discover_feed_id' );

const prettyFeedUrls = {
	[ DISCOVER_FEED_ID ]: '/discover',
};

const prettySiteUrls = {
	[ DISCOVER_SITE_ID ]: '/discover',
};

export function getPrettySiteUrl( siteID ) {
	return prettySiteUrls[ siteID ];
}

export function getPrettyFeedUrl( feedID ) {
	return prettyFeedUrls[ feedID ];
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

export function getTagStreamUrl( tag ) {
	return `/tag/${ tag }`;
}

export function getPostUrl( post ) {
	if ( post.feed_ID && post.feed_item_ID ) {
		return `/read/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }`;
	} else if ( post.is_external ) {
		return `/read/feeds/${ post.feed_ID }/posts/${ post.ID }`;
	}
	return `/read/blogs/${ post.site_ID }/posts/${ post.ID }`;
}
