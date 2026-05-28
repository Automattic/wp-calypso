import 'calypso/state/reader/init';
import { createSelector } from '@automattic/state-utils';
import { reject } from 'lodash';
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
		return items.map( ( item ) => ( { ...item } ) );
	},
	( state ) => [ state.reader.follows.items ]
);

export default getReaderFollows;
