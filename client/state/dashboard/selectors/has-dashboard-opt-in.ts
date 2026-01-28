import { isEnabled } from '@automattic/calypso-config';
import { getPreference } from 'calypso/state/preferences/selectors';
import { isDashboardEnabled } from './is-dashboard-enabled';
import type { HostingDashboardOptIn } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

export const hasDashboardOptIn = ( state: AppState ): boolean => {
	const preference = getPreference( state, 'hosting-dashboard-opt-in' ) as
		| HostingDashboardOptIn
		| undefined;

	if ( ! isDashboardEnabled( state ) ) {
		return preference?.value === 'forced-opt-in' || isEnabled( 'dashboard/forced-opt-in' );
	}

	return preference?.value === 'opt-in';
};

export const hasDashboardForcedOptIn = ( state: AppState ): boolean => {
	const preference = getPreference( state, 'hosting-dashboard-opt-in' ) as
		| HostingDashboardOptIn
		| undefined;

	return preference?.value === 'forced-opt-in' || isEnabled( 'dashboard/forced-opt-in' );
};
