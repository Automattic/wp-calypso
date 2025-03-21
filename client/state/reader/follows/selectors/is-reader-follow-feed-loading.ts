import 'calypso/state/reader/init';
import { AppState } from 'calypso/types';
import { ReaderFollowState } from './types';

/*
 * Whether or not the reader follows are loading
 */
export default function isReaderFollowFeedLoading( state: AppState, feedUrl: string ): boolean {
	const follows: ReaderFollowState = state.reader.follows;

	return follows.followFeedLoading.includes( feedUrl );
}
