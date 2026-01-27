import { isEnabled } from '@automattic/calypso-config';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';

export const OLDEST_ELIGIBLE_USER = 275231967; // Cut-off on 22 December 2025

export const isDashboardEnabled = ( state: AppState ): boolean => {
	if ( ! isEnabled( 'dashboard/v2' ) ) {
		return false;
	}

	const user = getCurrentUser( state ); // Ensure current user is loaded.
	if ( ! user || user.ID > OLDEST_ELIGIBLE_USER ) {
		return false;
	}

	return false;
};
