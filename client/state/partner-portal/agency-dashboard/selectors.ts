import { DefaultRootState } from 'react-redux';
import { Preference } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { getPreference } from 'calypso/state/preferences/selectors';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE =
	'jetpack-dashboard-welcome-banner-preference';

export const JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE_HOME_PAGE =
	'jetpack-dashboard-welcome-banner-preference-home-page';

/**
 * Returns preference associated with the welcome banner.
 *
 */
export function getJetpackDashboardWelcomeBannerPreference(
	state: DefaultRootState,
	key: string
): Preference {
	const preference = getPreference( state, key );
	return preference;
}
