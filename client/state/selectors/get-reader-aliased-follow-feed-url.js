/**
 * External Dependencies
 */
import { find, includes } from 'lodash';

/**
 * Internal Dependencies
 */
import { prepareComparableUrl } from 'state/reader/follows/utils';

/**
 * This selector will usually return the same feedUrl passed in.
 * If the feedUrl passed in is not in the follows reducer AND we can find an alias for it,
 * then return the feed_URL for the aliased feed.  This is specifically useful for cases where
 * example.com --> example.com/rss when users follow directly by url
 *
 * @param {object} state - The Redux state tree
 * @param {string} feedUrl - the url for which we are searching for a potential alias
 * @returns {string} either the original feedUrl or an aliased one.
 */
export default function getReaderAliasedFollowFeedUrl( state, feedUrl ) {
	const urlKey = prepareComparableUrl( feedUrl );

	if ( state.reader.follows.items[ urlKey ] ) {
		return urlKey;
	}

	const foundAlias = find( state.reader.follows.items, f => includes( f.alias_feed_URLs, urlKey ) );
	if ( foundAlias ) {
		return foundAlias.feed_URL;
	}

	return feedUrl;
}
