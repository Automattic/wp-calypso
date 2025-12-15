import { getPreference } from 'calypso/state/preferences/selectors';
import { isDashboardEnabled } from './is-dashboard-enabled';
import type { HostingDashboardOptIn } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

export const hasDashboardOptIn = ( state: AppState ): boolean => {
	if ( ! isDashboardEnabled( state ) ) {
		return false;
	}

	const preference = getPreference( state, 'hosting-dashboard-opt-in' ) as
		| HostingDashboardOptIn
		| undefined;
	return preference?.value === 'opt-in';
};
