/**
 * External dependencies
 */
import { find, includes, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { prepareComparableUrl } from 'state/reader/follows/utils';

import 'state/reader/init';

export const commonExtensions = [ 'rss', 'rss.xml', 'feed', 'feed/atom', 'atom.xml', 'atom' ];

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

	// first check for exact match
	if ( state.reader.follows.items[ urlKey ] ) {
		return urlKey;
	}

	// then check if any follows have saved aliases OR if there is a matching autodiscoverable alias
	const foundAlias = find(
		state.reader.follows.items,
		( follow, key ) =>
			includes( follow.alias_feed_URLs, urlKey ) ||
			some( commonExtensions, ( ext ) => `${ urlKey }/${ ext }` === key )
	);
	if ( foundAlias ) {
		return foundAlias.feed_URL;
	}

	return feedUrl;
}
