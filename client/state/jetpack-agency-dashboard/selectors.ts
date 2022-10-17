import { getPreference } from 'calypso/state/preferences/selectors';
import type {
	Preference,
	PurchasedProductsInfo,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import type { AppState } from 'calypso/types';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE =
	'jetpack-dashboard-welcome-banner-preference';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE_HOME_PAGE =
	'jetpack-dashboard-welcome-banner-preference-home-page';

export const JETPACK_AGENCY_DASHBOARD_DEFAULT_FILTER_CLEARED_KEY =
	'jetpack-dashboard-default-filter-cleared';

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
	return state.agencyDashboard.purchasedLicenseInfo;
}

/**
 * Returns the Jetpack dashboard link based on the filter status
 */
export function jetpackDashboardRedirectLink( state: AppState ): string {
	const isDefaultFilterCleared = getPreference(
		state,
		JETPACK_AGENCY_DASHBOARD_DEFAULT_FILTER_CLEARED_KEY
	);
	return isDefaultFilterCleared ? '/dashboard' : '/dashboard?issue_types=all_issues';
}
