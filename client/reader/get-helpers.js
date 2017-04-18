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
	const siteUrl = ( !! site ) && ( site.URL || site.domain );
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
		siteName = site.title || site.domain;
	} else if ( feed && ( feed.name || feed.title ) ) {
		siteName = feed.name || feed.title;
	} else if ( post && post.site_name ) {
		siteName = post.site_name;
	}

	/* less happy cases
	 * 1. error occured loading feed/site. only applies when not given a post.
	 * 2. there is genuinely no title, fallback to url
	 * 3. can't find anything, return null
	 */
	if ( ! siteName ) {
		if ( ( site && site.is_error ) || ( feed && feed.is_error ) && ( ! post ) ) {
			siteName = translate( 'Error fetching feed' );
		} else if ( getSiteUrl( { feed, site, post } ) ) {
			siteName = url.parse( getSiteUrl( { feed, site, post } ) ).hostname;
		}
	}

	return siteName;
};
