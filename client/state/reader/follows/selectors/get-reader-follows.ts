import 'calypso/state/reader/init';
import { createSelector } from '@automattic/state-utils';
import { reject } from 'lodash';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { AppState } from 'calypso/types';
import { ReaderFollowItem, ReaderFollowState } from './types';

/*
 * Get all sites/feeds the user follows.
 */
const getReaderFollows = createSelector(
	( state: AppState ) => {
		const follows: ReaderFollowState = state.reader.follows;
		// remove subs where the sub has an error
		const items: ReaderFollowItem[] = reject( Object.values( follows.items ), 'error' );

		// this is important. don't mutate the original items.
		const withSiteAndFeed = items.map( ( item ) => ( {
			...item,
			site: getSite( state, item.blog_ID ) as {
				is_error?: boolean;
				error?: { statusCode?: number };
			},
			feed: getFeed( state, item.feed_ID ) as { is_error?: boolean },
		} ) );

		// remove subs where the feed or site has an error
		const withoutErrors = reject(
			withSiteAndFeed,
			( item ) =>
				( item.site && item.site.is_error && item.site.error?.statusCode === 410 ) ||
				( item.feed && item.feed.is_error )
		) as typeof withSiteAndFeed;

		return withoutErrors;
	},
	( state ) => [
		state.reader.follows.items,
		state.reader.feeds.items,
		state.reader.sites.items,
		state.currentUser.capabilities,
	]
);

export default getReaderFollows;
