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
