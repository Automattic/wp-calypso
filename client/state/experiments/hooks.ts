/**
 * External Dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getVariationForUser, isLoading, getAnonId, nextRefresh } from './selectors';

/**
 * Returns true if the variations are loading for the current user
 */
export function useIsLoading(): boolean {
	return useSelector( isLoading );
}

/**
 * Returns the user's assigned variation for a given experiment
 *
 * @param experiment The name of the experiment
 */
export function useVariationForUser( experiment: string ): string | null {
	return useSelector( ( state ) => getVariationForUser( state, experiment ) );
}

/**
 * Gets the anon id for the user, if set
 */
export function useAnonId(): string | null {
	return useSelector( getAnonId );
}

/**
 * Get the time for the next variation refresh
 */
export function useNextRefresh(): number {
	return useSelector( nextRefresh );
}

type ExperimentInfo = {
	variation: string | null;
	anonId: string | null;
	nextRefresh: number;
	isLoading: boolean;
};

/**
 * Get the information for a given experiment
 *
 * @param experiment The name of the experiment
 */
export function useExperiment( experiment: string ): ExperimentInfo {
	return useSelector( ( state ) => ( {
		variation: getVariationForUser( state, experiment ),
		anonId: getAnonId( state ),
		nextRefresh: nextRefresh( state ),
		isLoading: isLoading( state ),
	} ) );
}
