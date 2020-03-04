/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;

export const getLastCreatedSite = ( state: State ) => state.lastCreatedSite;

/**
 * Indicates whether the last created site is still current based on
 * whether is was created within the last 10 minutes.
 *
 * @param {State} state		Global state tree
 * @returns {boolean}		true if activity is in progress
 */
export const isLastCreatedSiteCurrent = ( state: State ): boolean => {
	if ( state.lastCreatedSite?.createdTimestamp ) {
		return Date.now() - state.lastCreatedSite.createdTimestamp < 1000 * 600; // 10 minutes.
	}
	return false;
};
