import { isEnabled } from '@automattic/calypso-config';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';

// TODO: Set to a specific user when feature is rolled out to a limited audience.
export const OLDEST_ELIGIBLE_USER = Infinity;

export const isDashboardEnabled = ( state: AppState ): boolean => {
	if ( ! isEnabled( 'dashboard/v2' ) ) {
		return false;
	}

	const user = getCurrentUser( state ); // Ensure current user is loaded.
	if ( ! user || user.ID > OLDEST_ELIGIBLE_USER ) {
		return false;
	}

	return true;
};
