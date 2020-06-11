/**
 * External Dependencies
 */
import url from 'url';
import { translate } from 'i18n-calypso';
import { trim } from 'lodash';

/**
 * Internal Dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { isSiteDescriptionBlocked } from 'reader/lib/site-description-blocklist';

/**
 * Given a feed, site, or post: return the site url. return false if one could not be found.
 *
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
 * Given a feed, site, or post: return the feed url. return false if one could not be found.
 * The feed url is different from the site url in that it is unique per feed. A single siteUrl may
 * be home to many feeds
 *
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
 * Given a feed, site, or post: output the best title to use for the owning site.
 *
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
		siteName = siteUrl ? url.parse( siteUrl ).hostname : null;
	}

	return decodeEntities( siteName );
};

export const getSiteDescription = ( { site, feed } ) => {
	const description = ( site && site.description ) || ( feed && feed.description );
	if ( isSiteDescriptionBlocked( description ) ) {
		return null;
	}
	return description;
};

export const getSiteAuthorName = ( site ) => {
	const siteAuthor = site && site.owner;
	const authorFullName =
		siteAuthor &&
		( siteAuthor.name ||
			trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` ) );

	return decodeEntities( authorFullName );
};
