import { willBeRolledOut } from 'calypso/dashboard/utils/hosting-dashboard-enrollment';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';

export const isInDashboardRolloutCohort = ( state: AppState ): boolean => {
	return willBeRolledOut( getCurrentUserId( state ) ?? undefined );
};
