import 'calypso/state/reader/init';
import { find, includes, some } from 'lodash';
import { ReaderFollowItemType } from 'calypso/state/reader/follows/selectors/types';
import { prepareComparableUrl } from 'calypso/state/reader/follows/utils';
import { AppState } from 'calypso/types';

export const commonExtensions = [ 'rss', 'rss.xml', 'feed', 'feed/atom', 'atom.xml', 'atom' ];

/**
 * This selector will usually return the same feedUrl passed in.
 * If the feedUrl passed in is not in the follows reducer AND we can find an alias for it,
 * then return the feed_URL for the aliased feed.  This is specifically useful for cases where
 * example.com --> example.com/rss when users follow directly by url
 */
export default function getReaderAliasedFollowFeedUrl( state: AppState, feedUrl: string ): string {
	const urlKey = prepareComparableUrl( feedUrl );
	const followItems: ReaderFollowItemType = state.reader.follows.items;

	// first check for exact match
	if ( followItems[ urlKey ] ) {
		return urlKey;
	}

	// then check if any follows have saved aliases OR if there is a matching autodiscoverable alias
	const foundAlias = find(
		followItems,
		( follow, key ) =>
			includes( follow.alias_feed_URLs, urlKey ) ||
			some( commonExtensions, ( ext ) => `${ urlKey }/${ ext }` === key )
	);
	if ( foundAlias ) {
		return foundAlias.feed_URL;
	}

	return feedUrl;
}
