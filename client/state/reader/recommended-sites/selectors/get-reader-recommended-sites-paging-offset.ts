import 'calypso/state/reader/init';
import { AppState } from 'calypso/types';

/**
 * Returns the recommended sites paging offset
 */
export default ( state: AppState, seed: number ) => {
	return state.reader.recommendedSites.pagingOffset[ seed ];
};
