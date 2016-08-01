/**
 * External dependencies
 */
import { find, get } from 'lodash';
import url from 'url';
import config from 'config';
import Debug from 'debug';

const debug = Debug( 'calypso:reader:discover' ); // eslint-disable-line
/**
 * Internal Dependencies
 */
import userUtils from 'lib/user/utils';
import { getSiteUrl as readerRouteGetSiteUrl } from 'reader/route';

export function isDiscoverEnabled() {
	return userUtils.getLocaleSlug() === 'en';
}

export function isDiscoverPost( post ) {
	return !! ( get( post, 'discover_metadata' ) || get( post, 'site_ID' ) === config( 'discover_blog_id' ) );
}

export function isDiscoverSitePick( post ) {
	const metaData = get( post, 'discover_metadata.discover_fp_post_formats' );
	return !! ( metaData && find( metaData, { slug: 'site-pick' } ) );
}

export function isInternalDiscoverPost( post ) {
	return !! get( post, 'discover_metadata.featured_post_wpcom_data' );
}

export function getSiteUrl( post ) {
	const blogId = get( post, 'discover_metadata.featured_post_wpcom_data.blog_id' );
	// If we have a blog ID, we want to send them to the site detail page
	return blogId ? readerRouteGetSiteUrl( blogId ) : get( post, 'discover_metadata.permalink' );
}

export function hasSource( post ) {
	return this.isDiscoverPost( post ) && ! this.isDiscoverSitePick( post );
}

export function getSourceData( post ) {
	const sourceData = get( post, 'discover_metadata.featured_post_wpcom_data' );

	if ( sourceData && ! this.isDiscoverSitePick( post ) ) {
		return {
			blogId: get( sourceData, 'blog_id' ),
			postId: get( sourceData, 'post_id' )
		};
	}
	return null;
}

export function getLinkProps( linkUrl ) {
	const parsedUrl = url.parse( linkUrl ),
		hostname = get( parsedUrl, 'hostname' ),
		isExternal = hostname && hostname !== window.location.hostname;

	return {
		rel: isExternal ? 'external' : '',
		target: isExternal ? '_blank' : ''
	};
}

export function getSourceFollowUrl( post ) {
	let followUrl;

	if ( ! isDiscoverPost( post ) ) {
		return;
	}

	if ( isInternalDiscoverPost( post ) ) {
		followUrl = get( post, 'discover_metadata.attribution.blog_url' );
	}
	return followUrl || '';
}
