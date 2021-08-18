/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';

const getActivityLogDisplayRulesRequestStatus = (
	state: AppState,
	siteId: number | null
): string | undefined => {
	if ( ! Number.isInteger( siteId ) ) {
		return undefined;
	}

	return state.activityLog.displayRules[ siteId as number ]?.requestStatus;
};

export default getActivityLogDisplayRulesRequestStatus;
