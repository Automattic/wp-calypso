import { isOptInToggleVisible } from 'calypso/dashboard/utils/hosting-dashboard-enrollment';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { HostingDashboardOptIn } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

export const isDashboardToggleEnabled = ( state: AppState ): boolean => {
	const preference = getPreference( state, 'hosting-dashboard-opt-in' ) as
		| HostingDashboardOptIn
		| undefined;
	const userId = getCurrentUserId( state ) ?? undefined;

	return isOptInToggleVisible( preference, userId );
};
