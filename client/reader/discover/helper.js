import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { find, get } from 'lodash';
import { getSiteUrl as readerRouteGetSiteUrl } from 'calypso/reader/route';

const DEFAULT_DISCOVER_TAGS = [ 'dailyprompt', 'wordpress' ];
export const DEFAULT_TAB = 'recommended';
export const LATEST_TAB = 'latest';
/**
 * Filters tags data and returns the tags intended to be loaded by the discover pages recommended
 * section. If tags is null, we return an empty array as we have yet to recieve the users followed
 * tags list. If the users followed tags list is empty, we return a default array of tags used to
 * load the feed. Otherwise, load the feed based on the users follwed tags.
 *
 * @param {Array | null} tags Array of tag slugs to evaluate
 * @returns {Array} Array of tag slugs that will be used for the discover stream.
 */
export function getDiscoverStreamTags( tags, isLoggedIn ) {
	// If tags === [], we load default discover tags. If tags is falsy, we need to wait for the data
	// before determining whether or not to load defaults or use the followed tags array.
	if ( ! tags && isLoggedIn ) {
		return [];
	} else if ( tags?.length === 0 || ! isLoggedIn ) {
		return DEFAULT_DISCOVER_TAGS;
	}
	return tags;
}

/**
 * Builds a stream key for the discover feed based on the selectedTab and tags for recommended feed.
 *
 * @param {string} selectedTab The discover feed tab that is selected
 * @param {Array} tags The list of tags to use for the recommended feed.
 * @returns {string} The stream key
 */
export function buildDiscoverStreamKey( selectedTab, tags ) {
	let streamKey = `discover:${ selectedTab }`;
	// We want a different stream key for recommended depending on the followed tags that are available.
	if ( selectedTab === DEFAULT_TAB || selectedTab === LATEST_TAB ) {
		// Ensures a different key depending on the users stream tags list. So the stream can update
		// when the user follows/unfollows other tags. Sort the list first so the key is the same
		// per same tags followed. This is necessary since we load a default tag list when none are
		// followed.
		tags.sort();
		streamKey += tags.reduce( ( acc, val ) => acc + `--${ val }`, '' );
	}
	return streamKey;
}

/**
 * Retrieves an array of tags from the discover stream key.
 *
 * @param {string} streamKey The streamKey denoting the tags for the feed.
 * @returns {Array} An array of tag slugs.
 */
export function getTagsFromStreamKey( streamKey = '' ) {
	if (
		streamKey.includes( `discover:${ DEFAULT_TAB }` ) ||
		streamKey.includes( `discover:${ LATEST_TAB }` )
	) {
		const tags = streamKey.split( '--' );
		tags.shift();
		return tags;
	}
	return [];
}

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
	return true;
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
