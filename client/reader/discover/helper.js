/**
 * External dependencies
 */
import { find, get } from 'lodash';
import config from 'calypso/config';

/**
 * Internal dependencies
 */
import { getSiteUrl as readerRouteGetSiteUrl } from 'calypso/reader/route';
import { getUrlParts } from 'calypso/lib/url';

function hasDiscoverSlug( post, searchSlug ) {
	const metaData = get( post, 'discover_metadata.discover_fp_post_formats' );
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
	return false;
}

export function isDiscoverPost( post ) {
	return !! (
		get( post, 'discover_metadata' ) || get( post, 'site_ID' ) === config( 'discover_blog_id' )
	);
}

export function isDiscoverSitePick( post ) {
	return hasDiscoverSlug( post, 'site-pick' );
}

export function isInternalDiscoverPost( post ) {
	return !! get( post, 'discover_metadata.featured_post_wpcom_data' );
}

export function getSiteUrl( post ) {
	const blogId = get( post, 'discover_metadata.featured_post_wpcom_data.blog_id' );
	// If we have a blog ID, we want to send them to the site detail page
	return blogId ? readerRouteGetSiteUrl( blogId ) : get( post, 'discover_metadata.permalink' );
}

export function getDiscoverBlogName( post ) {
	return get( post, 'discover_metadata.attribution.blog_name' );
}

export function hasSource( post ) {
	return isDiscoverPost( post ) && ! isDiscoverSitePick( post );
}

export function getSourceData( post ) {
	const sourceData = get( post, 'discover_metadata.featured_post_wpcom_data' );

	if ( sourceData ) {
		return {
			blogId: get( sourceData, 'blog_id' ),
			postId: get( sourceData, 'post_id' ),
		};
	}
	return {};
}

export function getLinkProps( linkUrl ) {
	const { hostname } = getUrlParts( linkUrl );
	const isExternal = hostname && hostname !== window.location.hostname;

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

	followUrl = get( post, 'discover_metadata.attribution.blog_url' );

	// If it's a site pick, try the permalink
	if ( ! followUrl && isDiscoverSitePick( post ) ) {
		followUrl = get( post, 'discover_metadata.permalink' );
	}

	return followUrl || '';
}
