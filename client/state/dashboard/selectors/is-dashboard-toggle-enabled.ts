import { isEnabled } from '@automattic/calypso-config';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';

const OLDEST_ELIGIBLE_USER = 275231967; // Cut-off on 22 December 2025

/**
 * Determine whether to display the dashboard toggle. Only users created
 * before 22 December 2025 can manually opt in or out.
 */
export const isDashboardToggleEnabled = ( state: AppState ): boolean => {
	if ( ! isEnabled( 'dashboard/v2' ) ) {
		return false;
	}

	const user = getCurrentUser( state ); // Ensure current user is loaded.
	if ( ! user || user.ID > OLDEST_ELIGIBLE_USER ) {
		return false;
	}

	return true;
};
