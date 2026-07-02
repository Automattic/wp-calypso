import { willBeRolledOut as willUserBeRolledOut } from 'calypso/dashboard/utils/hosting-dashboard-enrollment';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';

export const willBeRolledOut = ( state: AppState ): boolean => {
	return willUserBeRolledOut( getCurrentUserId( state ) ?? undefined );
};
