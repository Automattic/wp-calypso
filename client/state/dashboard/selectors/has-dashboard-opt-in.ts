import { isEnabled } from '@automattic/calypso-config';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { HostingDashboardOptIn } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

export const hasDashboardOptIn = ( state: AppState ): boolean => {
	const preference = getPreference( state, 'hosting-dashboard-opt-in' ) as
		| HostingDashboardOptIn
		| undefined;

	return (
		preference?.value === 'opt-in' ||
		preference?.value === 'forced-opt-in' ||
		isEnabled( 'dashboard/forced-opt-in' )
	);
};
