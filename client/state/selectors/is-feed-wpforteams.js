/**
 * Internal dependencies
 */
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/**
 * Check whether a feed is a wpforteams site (new p2)
 *
 * @param {object} state redux state
 * @param {number} feedId feed identifier
 *
 * @returns {boolean} whether or not the feed is for a wpforteams site
 */
export default function isFeedWPForTeams( state, feedId ) {
	const feed = getFeed( state, feedId );

	if ( ! feed || ! feed.blog_ID ) {
		return false;
	}

	return isSiteWPForTeams( state, feed.blog_ID );
}
