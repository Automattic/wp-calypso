/**
 * Internal Dependencies
 */
import { AppState } from 'types';

export function getVariationForUser( state: AppState, experiment: string ) {
	return experiment;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isLoading = ( state: AppState, experimentName: string ) => {
	return true;
};
