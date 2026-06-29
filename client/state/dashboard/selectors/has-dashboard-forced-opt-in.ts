import { getHostingDashboardEnrollment } from 'calypso/dashboard/utils/hosting-dashboard-enrollment';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { HostingDashboardOptIn } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

export const hasDashboardForcedOptIn = ( state: AppState ): boolean => {
	const preference = getPreference( state, 'hosting-dashboard-opt-in' ) as
		| HostingDashboardOptIn
		| undefined;
	const userId = getCurrentUserId( state ) ?? undefined;
	const enrollment = getHostingDashboardEnrollment( preference, userId );

	return enrollment.enrolled && enrollment.reason === 'forced';
};
