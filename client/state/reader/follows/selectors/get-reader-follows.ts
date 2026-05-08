import 'calypso/state/reader/init';
import { createSelector } from '@automattic/state-utils';
import { reject } from 'lodash';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { AppState } from 'calypso/types';
import { ReaderFollowItem, ReaderFollowState } from './types';

/*
 * Get all sites/feeds the user follows.
 *
 * The legacy implementation also stripped follows whose `getSite( blog_ID )`
 * had `is_error: true && statusCode === 410`. Site data has moved to React
 * Query and is no longer mirrored in Redux state, so 410 sites are no longer
 * filtered here — they fall through and the consumer surfaces the error.
 */
const getReaderFollows = createSelector(
	( state: AppState ) => {
		const follows: ReaderFollowState = state.reader.follows;
		// remove subs where the sub has an error
		const items: ReaderFollowItem[] = reject( Object.values( follows.items ), 'error' );

		// this is important. don't mutate the original items.
		const withFeed = items.map( ( item ) => ( {
			...item,
			feed: getFeed( state, item.feed_ID ) as { is_error?: boolean },
		} ) );

		// remove subs where the feed has an error
		const withoutErrors = reject(
			withFeed,
			( item ) => item.feed && item.feed.is_error
		) as typeof withFeed;

		return withoutErrors;
	},
	( state ) => [
		state.reader.follows.items,
		state.reader.feeds.items,
		state.currentUser.capabilities,
	]
);

export default getReaderFollows;
