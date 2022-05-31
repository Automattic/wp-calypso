import type { AppState } from 'calypso/types';

import 'calypso/state/jetpack-agency-dashboard/init';

export const getFilter = ( state: AppState ) => {
	return state.jetpackAgencyDashboard.filter || {};
};
