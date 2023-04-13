import { getPreference } from 'calypso/state/preferences/selectors';
import type {
	Preference,
	AllowedTypes,
	PurchasedProductsInfo,
	SiteMonitorStatus,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import type { AppState } from 'calypso/types';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE =
	'jetpack-dashboard-welcome-banner-preference';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE_HOME_PAGE =
	'jetpack-dashboard-welcome-banner-preference-home-page';

/**
 * Returns preference associated with the welcome banner.
 */
export function getJetpackDashboardWelcomeBannerPreference(
	state: AppState,
	key: string
): Preference {
	const preference = getPreference( state, key );
	return preference;
}

export function checkIfJetpackSiteGotDisconnected( state: AppState ): boolean {
	return !! state.sites.jetpackSiteDisconnected;
}

export function getPurchasedLicense( state: AppState ): PurchasedProductsInfo | null {
	return state.agencyDashboard.purchasedLicense?.purchasedLicenseInfo;
}

/**
 * Returns the selected licenses from the dashboard.
 */
export function getSelectedLicenses( state: AppState ): Array< string > {
	return state.agencyDashboard?.selectedLicenses?.licenses;
}

/**
 * Returns the selected licenses site.
 */
export function getSelectedLicensesSiteId( state: AppState ): number | null {
	return state.agencyDashboard?.selectedLicenses?.siteId;
}

/**
 * Returns licenses of a specific type among the selected ones.
 */
export function hasSelectedLicensesOfType(
	state: AppState,
	siteId: number,
	type: AllowedTypes
): boolean {
	return (
		state.agencyDashboard?.selectedLicenses?.siteId === siteId &&
		state.agencyDashboard?.selectedLicenses?.licenses.includes( type )
	);
}

export function getSiteMonitorStatuses( state: AppState ): SiteMonitorStatus {
	return state.agencyDashboard?.siteMonitorStatus?.statuses;
}
