/**
 * Internal Dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Returns the user's assigned variation for a given experiment
 *
 * @param state The application state
 * @param experiment The name of the experiment
 */
export const getVariationForUser = ( state: AppState, experiment: string ): string | null =>
	state?.experiments?.variations?.[ experiment ] || null;

/**
 * Returns true if the variations are loading for the current user
 *
 * @param state The application state
 */
export const isLoading = ( state: AppState ): boolean => state?.experiments?.isLoading || false;

/**
 * Gets the anon id for the user, if set
 *
 * @param state The application state
 */
export const getAnonId = ( state: AppState ): string | null => state?.experiments?.anonId || null;

/**
 * Get the time for the next variation refresh
 *
 * @param state The application state
 */
export const nextRefresh = ( state: AppState ): number =>
	state?.experiments?.nextRefresh || Date.now();
