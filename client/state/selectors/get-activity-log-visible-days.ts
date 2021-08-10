/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Returns the number of days of Activity Log data that should be visible
 * if the given site ID has defined display rules;
 * otherwise, returns undefined.
 *
 * @param state The application state.
 * @param siteId The site for which to retrieve display rules.
 * @returns If display rules are defined, the number of days of Activity Log
 * 			data that should be visible; otherwise, undefined.
 */
const getActivityLogVisibleDays = ( state: AppState, siteId: number ): number | undefined => {
	if ( ! Number.isInteger( siteId ) ) {
		return undefined;
	}

	return state.activityLog.displayRules[ siteId as number ]?.days ?? undefined;
};

export default getActivityLogVisibleDays;
