import 'calypso/state/reader/init';
import { find } from 'lodash';
import { AppState } from 'calypso/types';
import { ReaderFollowItem, ReaderFollowState } from './types';

/*
 * Find the first follow for a given feed ID.
 */
export default function getFeedSubscriptionById(
	state: AppState,
	feedId: number
): ReaderFollowItem | undefined {
	const follows: ReaderFollowState = state.reader.follows;

	return find( follows.items, { feed_ID: feedId } );
}
