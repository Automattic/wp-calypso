import 'calypso/state/reader/init';
import { AppState } from 'calypso/types';

/**
 * Returns the recommended sites for a given seed.
 */
export default < T >( state: AppState, seed: number ): T[] => {
	return state.reader.recommendedSites.items[ seed ];
};
