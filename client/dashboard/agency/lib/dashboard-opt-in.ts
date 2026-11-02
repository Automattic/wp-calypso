import { isEnabled } from '@automattic/calypso-config';
import type { AgencyDashboardOptIn } from '@automattic/api-core';

// Both A4A clients call these, and their `Agency` types differ, so take only what's read.
type OptInAgency =
	{ billing_system?: string; dashboard_opt_in?: AgencyDashboardOptIn } | null | undefined;

function canUseNewAgencyDashboard( agency: OptInAgency ) {
	return isEnabled( 'a4a-dashboard-opt-in' ) && agency?.billing_system === 'billingdragon';
}

/**
 * Whether the agency uses the Multi-site Dashboard. Only agencies on Billing Dragon can.
 */
export function isOnNewAgencyDashboard( agency: OptInAgency ): boolean {
	const value = agency?.dashboard_opt_in?.value;
	return canUseNewAgencyDashboard( agency ) && ( value === 'opt-in' || value === 'forced-opt-in' );
}

/**
 * Whether the agency can switch dashboards itself. Forced values change only through support.
 */
export function canSwitchAgencyDashboard( agency: OptInAgency ): boolean {
	const value = agency?.dashboard_opt_in?.value;
	return (
		canUseNewAgencyDashboard( agency ) && value !== 'forced-opt-in' && value !== 'forced-opt-out'
	);
}
