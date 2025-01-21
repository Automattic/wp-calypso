import { getPreference } from 'calypso/state/preferences/selectors';
import type { AppState } from 'calypso/types';

export const SITES_AS_LANDING_PAGE_PREFERENCE = 'sites-landing-page';

export const hasSitesAsLandingPage = ( state: AppState ): boolean => {
	const { useSitesAsLandingPage = false } = getPreference(
		state,
		SITES_AS_LANDING_PAGE_PREFERENCE
	);
	return !! useSitesAsLandingPage;
};
