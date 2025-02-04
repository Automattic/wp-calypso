import { getPreference } from 'calypso/state/preferences/selectors';
import type {
	Preference,
	AllowedTypes,
	PurchasedProductsInfo,
	SiteMonitorStatus,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import type { AppState } from 'calypso/types';

export const JETPACK_DASHBOARD_CHECKOUT_REDIRECT_MODAL_DISMISSED =
	'agency-program-checkout-redirect-modal-dismissed';

export const JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_BANNER_PREFERENCE =
	'jetpack-dashboard-agency-program-downtime-monitoring-upgrade-banner-preference';

export const JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_TOOLTIP_PREFERENCE =
	'jetpack-dashboard-agency-program-downtime-monitoring-upgrade-tooltip-preference';

// Whether the quick links nav on the overview page is expanded
export const JETPACK_DASHBOARD_QUICK_LINKS_NAV_PREFERENCE =
	'jetpack-dashboard-quick-links-nav-preference';

// Whether the get help nav on the overview page is expanded
export const JETPACK_DASHBOARD_GET_HELP_NAV_PREFERENCE =
	'jetpack-dashboard-get-help-nav-preference';

export const JETPACK_DASHBOARD_SURVEY_BANNER_PREFERENCE =
	'jetpack-dashboard-agency-program-survey-banner-preference';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE =
	'jetpack-dashboard-welcome-banner-preference';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE_HOME_PAGE =
	'jetpack-dashboard-welcome-banner-preference-home-page';

export const JETPACK_DASHBOARD_WPCOM_HOSTING_FEATURE_TOOLTIP_PREFERENCE =
	'jetpack-dashboard-agency-program-wpcom-hosting-feature-tooltip-preference';

/**
 * Returns preference associated with the key provided.
 */
export function getJetpackDashboardPreference( state: AppState, key: string ): Preference {
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
 * Returns the selected licenses from the dashboard for all sites.
 */
export function getSelectedSiteLicenses(
	state: AppState
): Array< { siteId: number; products: Array< string > } > {
	return state.agencyDashboard?.selectedSiteLicenses?.licenses || [];
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

/**
 * Returns true if there are any licenses of a specific type among the selected ones for a specific site.
 */
export function hasSelectedSiteLicensesOfType(
	state: AppState,
	siteId: number,
	type: AllowedTypes
): boolean {
	return !! state.agencyDashboard?.selectedSiteLicenses?.licenses.find(
		( license: any ) => license.siteId === siteId && license.products.includes( type )
	);
}

export function getSiteMonitorStatuses( state: AppState ): SiteMonitorStatus {
	return state.agencyDashboard?.siteMonitorStatus?.statuses;
}
