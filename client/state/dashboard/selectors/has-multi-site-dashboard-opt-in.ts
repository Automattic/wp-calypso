import { getPreference } from 'calypso/state/preferences/selectors';
import { isMultiSiteDashboardEnabled } from './is-multi-site-dashboard-enabled';
import type { HostingDashboardOptIn } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

export const hasMultiSiteDashboardOptIn = ( state: AppState ): boolean => {
	if ( ! isMultiSiteDashboardEnabled( state ) ) {
		return false;
	}

	const preference = getPreference( state, 'hosting-dashboard-opt-in' ) as
		| HostingDashboardOptIn
		| undefined;
	return preference?.value === 'opt-in';
};
