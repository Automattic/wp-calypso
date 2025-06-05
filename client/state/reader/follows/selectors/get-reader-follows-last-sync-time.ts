import 'calypso/state/reader/init';
import { AppState } from 'calypso/types';
import { ReaderFollowState } from './types';

export default function getReaderFollowsLastSyncTime( state: AppState ): number | null {
	const follows: ReaderFollowState = state.reader.follows;

	return follows.lastSyncTime;
}
