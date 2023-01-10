import { getPreference } from 'calypso/state/preferences/selectors';
import type { AppState } from 'calypso/types';

export const SITES_AS_LANDING_PAGE_PREFERENCE = 'sites-landing-page';

export const SITES_AS_LANDING_PAGE_DEFAULT_VALUE = {
	useSitesAsLandingPage: false,
	updatedAt: 0,
};

export const hasSitesAsLandingPage = ( state: AppState ): boolean => {
	const { useSitesAsLandingPage } =
		getPreference( state, SITES_AS_LANDING_PAGE_PREFERENCE ) ?? SITES_AS_LANDING_PAGE_DEFAULT_VALUE;

	return useSitesAsLandingPage;
};
