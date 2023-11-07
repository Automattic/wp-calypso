import { getCurrentUser } from '../current-user/selectors';
import type { AppState } from '../../types';

export const isUserEligibleForFreeHostingTrial = ( state: AppState ) => {
	const currentUser = getCurrentUser( state );

	if ( ! currentUser ) {
		return false;
	}

	return ! currentUser.had_hosting_trial;
};
