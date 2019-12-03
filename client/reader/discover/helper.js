/**
 * External dependencies
 */
import { find } from 'lodash';
import url from 'url';
import config from 'config';
import Debug from 'debug';

const debug = Debug( 'calypso:reader:discover' ); // eslint-disable-line
/**
 * Internal Dependencies
 */
import userUtils from 'lib/user/utils';
import { getSiteUrl as readerRouteGetSiteUrl } from 'reader/route';

function hasDiscoverSlug( post, searchSlug ) {
	const metaData = post?.discover_metadata?.discover_fp_post_formats;
	return !! ( metaData && find( metaData, { slug: searchSlug } ) );
}

export const discoverBlogId = config( 'discover_blog_id' );

export function isDiscoverBlog( blogId ) {
	return +blogId === config( 'discover_blog_id' );
}

export function isDiscoverFeed( feedId ) {
	return +feedId === config( 'discover_feed_id' );
}

export function isDiscoverEnabled() {
	return userUtils.getLocaleSlug() === 'en';
}

export function isDiscoverPost( post ) {
	return !! ( post?.discover_metadata || post?.site_ID === config( 'discover_blog_id' ) );
}

export function isDiscoverSitePick( post ) {
	return hasDiscoverSlug( post, 'site-pick' );
}

export function isInternalDiscoverPost( post ) {
	return !! post?.discover_metadata?.featured_post_wpcom_data;
}

export function getSiteUrl( post ) {
	const blogId = post?.discover_metadata?.featured_post_wpcom_data?.blog_id;
	// If we have a blog ID, we want to send them to the site detail page
	return blogId ? readerRouteGetSiteUrl( blogId ) : post?.discover_metadata?.permalink;
}

export function getDiscoverBlogName( post ) {
	return post?.discover_metadata?.attribution?.blog_name;
}
export function hasSource( post ) {
	return isDiscoverPost( post ) && ! isDiscoverSitePick( post );
}

export function getSourceData( post ) {
	const sourceData = post?.discover_metadata?.featured_post_wpcom_data;

	if ( sourceData ) {
		return {
			blogId: sourceData?.blog_id,
			postId: sourceData?.post_id,
		};
	}
	return {};
}

export function getLinkProps( linkUrl ) {
	const parsedUrl = url.parse( linkUrl ),
		hostname = parsedUrl?.hostname,
		isExternal = hostname && hostname !== window.location.hostname;

	return {
		rel: isExternal ? 'external' : '',
		target: isExternal ? '_blank' : '',
	};
}

export function getSourceFollowUrl( post ) {
	let followUrl;

	if ( ! isDiscoverPost( post ) ) {
		return;
	}

	followUrl = post?.discover_metadata?.attribution?.blog_url;

	// If it's a site pick, try the permalink
	if ( ! followUrl && isDiscoverSitePick( post ) ) {
		followUrl = post?.discover_metadata?.permalink;
	}

	return followUrl || '';
}
