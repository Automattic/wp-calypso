import 'calypso/state/reader/init';
import { filter } from 'lodash';
import { AppState } from 'calypso/types';
import { ReaderFollowState } from './types';

/*
 * Get the count of follows a user has
 */
export default function getReaderFollowsCount( state: AppState ): number {
	const follows: ReaderFollowState = state.reader.follows;

	return Math.max(
		follows.itemsCount,
		Object.keys( filter( follows.items, { is_following: true } ) ).length
	);
}
