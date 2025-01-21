import { getPreference } from 'calypso/state/preferences/selectors';
import type { AppState } from 'calypso/types';

export const SITES_AS_LANDING_PAGE_PREFERENCE = 'sites-landing-page';

export const hasSitesAsLandingPage = ( state: AppState ): boolean => {
	const preference = getPreference( state, SITES_AS_LANDING_PAGE_PREFERENCE ) || {};
	const { useSitesAsLandingPage = false } = preference;
	return !! useSitesAsLandingPage;
};
