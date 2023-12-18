import { isEnabled } from '@automattic/calypso-config';
import { getCurrentUser } from '../current-user/selectors';
import type { AppState } from '../../types';

export const isUserEligibleForFreeHostingTrial = ( state: AppState ) => {
	if ( ! isEnabled( 'plans/hosting-trial' ) ) {
		return false;
	}

	const currentUser = getCurrentUser( state );

	if ( ! currentUser ) {
		return false;
	}

	return ! currentUser.had_hosting_trial;
};
