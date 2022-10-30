import { getPreference } from 'calypso/state/preferences/selectors';
import type {
	Preference,
	PurchasedProduct,
	AllowedTypes,
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

export function getPurchasedLicense( state: AppState ): PurchasedProduct | null {
	return state.agencyDashboard.purchasedLicense;
}

/**
 * Returns the selected licenses from the dashboard.
 */
export function getSelectedLicenses( state: AppState ): {
	siteId: number | null;
	licenses: Array< string >;
} {
	return state.agencyDashboard.selectedLicenses;
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
		state.agencyDashboard.selectedLicenses?.siteId === siteId &&
		state.agencyDashboard.selectedLicenses?.licenses.includes( type )
	);
}
