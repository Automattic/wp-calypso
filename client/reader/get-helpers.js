import { getUrlParts } from '@automattic/calypso-url';
import { translate } from 'i18n-calypso';
import { trim } from 'lodash';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { isSiteDescriptionBlocked } from 'calypso/reader/lib/site-description-blocklist';

/**
 * Given a feed, site, or post: return the site url. return false if one could not be found.
 * @param {*} options - an object containing a feed, site, and post. all optional.
 * @returns {string} the site url
 */
export const getSiteUrl = ( { feed, site, post } = {} ) => {
	const siteUrl = !! site && ( site.URL || site.domain );
	const feedUrl = !! feed && ( feed.URL || feed.feed_URL );
	const postUrl = !! post && post.site_URL;

	if ( ! siteUrl && ! feedUrl && ! postUrl ) {
		return undefined;
	}

	return siteUrl || feedUrl || postUrl;
};

/**
 * Given a feed, site, or post: return the site icon. return false if one could not be found.
 * @param {Object} post - Post object.
 * @returns {string|undefined} Url of the site icon or undefined if not found.
 */
export function getPostIcon( post ) {
	return post?.site_icon?.img || post?.site_icon || post?.author?.avatar_URL;
}

/**
 * Given a feed, site, or post: return the feed url. return false if one could not be found.
 * The feed url is different from the site url in that it is unique per feed. A single siteUrl may
 * be home to many feeds
 * @param {*} options - an object containing a feed, site, and post. all optional.
 * @returns {string} the site url
 */
export const getFeedUrl = ( { feed, site, post } = {} ) => {
	const siteUrl = !! site && site.feed_URL;
	const feedUrl = !! feed && ( feed.feed_URL || feed.URL );
	const postUrl = !! post && post.feed_URL;

	return siteUrl || feedUrl || postUrl;
};

/**
 * getSiteDomain function extracts the domain of a website from the provided `site` and `feed` objects.
 * It returns the domain of the site if available, otherwise, it extracts the domain from the site URL.
 * @param {Object} param0 - An object containing `feed` and `site` objects.
 * @param {Object|undefined} param0.feed - An object representing the feed data.
 * @param {Object} param0.site - An object representing the site data. If it has a `domain` property and it is a string, that will be returned directly.
 * @returns {string} - The domain of the site. If the `site` object has a `domain` property that is a string,
 *                      it returns that. Otherwise, it gets the URL of the site from the `feed` and `site` objects,
 *                      extracts the hostname from the URL, and returns it. If the hostname is an empty string,
 *                      it returns the site URL. If the hostname starts with "www.", it removes the "www." and returns the rest.
 */
export const getSiteDomain = ( { feed, site } = {} ) => {
	if ( typeof site?.domain === 'string' ) {
		return site.domain;
	}

	const siteUrl = getSiteUrl( { feed, site } );
	const hostname = getUrlParts( siteUrl ).hostname;
	return formatUrlForDisplay( hostname === '' ? siteUrl : hostname );
};

/**
 * Given a feed, site, or post: output the best title to use for the owning site.
 * @param {*} options - an object containing a feed, site, and post. all optional
 * @returns {string} the site title
 */
export const getSiteName = ( { feed, site, post } = {} ) => {
	let siteName = null;
	const isDefaultSiteTitle =
		( site && site.name === translate( 'Site Title' ) ) ||
		( feed && feed.name === translate( 'Site Title' ) );

	if ( ! isDefaultSiteTitle && site && site.title ) {
		siteName = site.title;
	} else if ( ! isDefaultSiteTitle && feed && ( feed.name || feed.title ) ) {
		siteName = feed.name || feed.title;
	} else if ( ! isDefaultSiteTitle && post && post.site_name ) {
		siteName = post.site_name;
	} else if ( site && site.is_error && feed && feed.is_error && ! post ) {
		siteName = translate( 'Error fetching feed' );
	} else if ( site && site.domain ) {
		siteName = site.domain;
	} else {
		const siteUrl = getSiteUrl( { feed, site, post } );
		siteName = siteUrl ? getUrlParts( siteUrl ).hostname : null;
	}

	return decodeEntities( siteName );
};

export const getSiteDescription = ( { site, feed } ) => {
	const description = ( site && site.description ) || ( feed && feed.description );
	if ( isSiteDescriptionBlocked( description ) ) {
		return null;
	}
	return description ? stripHTML( description ) : description;
};

export const getSiteAuthorName = ( site ) => {
	const siteAuthor = site && site.owner;
	const authorFullName =
		siteAuthor &&
		( siteAuthor.name ||
			trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` ) );

	return decodeEntities( authorFullName );
};

/**
 * Check if route or feed/blog is eligible to use seen posts feature (unseen counts and mark as seen)
 * @param {Object} flags eligibility data
 * @param {string} flags.currentRoute current route
 * @param {boolean} flags.isWPForTeamsItem id if exists
 * @param {boolean} flags.hasOrganization id if exists
 * @returns {boolean} whether or not the user can use the feature for the given site
 */
export const isEligibleForUnseen = ( {
	isWPForTeamsItem = false,
	currentRoute = null,
	hasOrganization = null,
} ) => {
	let isEligible = isWPForTeamsItem;
	if ( hasOrganization !== null ) {
		isEligible = hasOrganization;
	}

	if ( currentRoute ) {
		if (
			[ '/reader/a8c', '/reader/p2' ].includes( currentRoute ) ||
			[ '/reader/feeds/', '/reader/blogs/' ].some( ( route ) => currentRoute.startsWith( route ) )
		) {
			return isEligible;
		}

		return false;
	}

	return isEligible;
};

/**
 * Check if the post/posts can be marked as seen based on the existence of `is_seen` flag and the current route.
 * @param {Object} params method params
 * @param {Object} params.post object
 * @param {Array} params.posts list
 * @returns {boolean} whether or not the post can be marked as seen
 */
export const canBeMarkedAsSeen = ( { post = null, posts = [] } ) => {
	if ( post !== null ) {
		return post.hasOwnProperty( 'is_seen' );
	}

	if ( posts.length ) {
		for ( const thePost in posts ) {
			if ( thePost.hasOwnProperty( 'is_seen' ) ) {
				return true;
			}
		}
	}

	return false;
};

/**
 * Return Featured image alt text.
 * @param {Object} post object containing post information
 * @returns {string} Featured image alt text
 */
export const getFeaturedImageAlt = ( post ) => {
	// Each post can have multiple images attached. To make sure we are selecting
	// the alt text of the correct image attachment, we get the ID of the post thumbnail first
	// and then use it to get the alt text of the Featured image.
	const postThumbnailId = post?.post_thumbnail?.ID;
	const featuredImageAlt = post?.attachments?.[ postThumbnailId ]?.alt;
	const postTitle = post.title;

	// If there is no Featured image alt text available, return post title instead.
	// This will make sure that the featured image has at least some relevant alt text.
	if ( ! featuredImageAlt ) {
		// translators: Adds explanation to the Featured image alt text in Reader
		return translate( '%(postTitle)s - featured image', { args: { postTitle } } );
	}

	return featuredImageAlt;
};

/**
 * Get the follower count from a site/feed.
 * @param {Object} feed Feed object.
 * @param {Object} site Site object.
 * @returns {number|null}
 */
export const getFollowerCount = ( feed, site ) => {
	if ( site && site.subscribers_count ) {
		return site.subscribers_count;
	}

	if ( feed && feed.subscribers_count > 0 ) {
		return feed.subscribers_count;
	}

	return null;
};
