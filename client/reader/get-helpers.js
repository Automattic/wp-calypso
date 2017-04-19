/**
 * External Dependencies
 */
import url from 'url';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */

/**
 * Given a feed, site, or post: return the url. return false if one could not be found.
 *
 * @param {*} options - an object containing a feed, site, and post. all optional.
 * @returns {string} the site url
 */
export const getSiteUrl = ( { feed, site, post } = {} ) => {
	const siteUrl = ( !! site ) && ( site.URL );
	const feedUrl = ( !! feed ) && ( feed.URL || feed.feed_URL );
	const postUrl = ( !! post ) && ( post.site_URL || post.feed_URL );

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

	if ( site && site.title ) {
		siteName = site.title;
	} else if ( feed && ( feed.name || feed.title ) ) {
		siteName = feed.name || feed.title;
	} else if ( post && post.site_name ) {
		siteName = post.site_name;
	} else if ( ( site && site.is_error ) || ( feed && feed.is_error ) && ( ! post ) ) {
		siteName = translate( 'Error fetching feed' );
	} else if ( site && site.domain ) {
		siteName = site.domain;
	} else {
		const siteUrl = getSiteUrl( { feed, site, post } );
		siteName = ( !! siteUrl ) ? url.parse( siteUrl ).hostname : null;
	}

	return siteName;
};
