import 'calypso/state/reader/init';
import { find } from 'lodash';
import { AppState } from 'calypso/types';
import { ReaderFollowItem, ReaderFollowState } from './types';

/*
 * Find the first follow for a given blog ID
 */
export default function getFeedSubscriptionByBlogId(
	state: AppState,
	blogId: number
): ReaderFollowItem | undefined {
	const follows: ReaderFollowState = state.reader.follows;

	return find( follows.items, ( item ) => item.blog_ID === Number( blogId ) );
}
