/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Returns the number of days of accessible Activity Log data
 * if the given site ID has a defined retention period;
 * otherwise, returns undefined.
 *
 * @param state The application state.
 * @param siteId The site for which to retrieve retention period data.
 * @returns If a retention period is defined, the number of days activity log data is retained; otherwise, undefined.
 */
const getSiteActivityLogRetentionDays = ( state: AppState, siteId: number ): number | undefined => {
	if ( ! Number.isInteger( siteId ) ) {
		return undefined;
	}

	return state.activityLog.retentionPolicy[ siteId as number ]?.days ?? undefined;
};

export default getSiteActivityLogRetentionDays;
