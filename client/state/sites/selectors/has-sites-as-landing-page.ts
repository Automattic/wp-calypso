import { getPreference } from 'calypso/state/preferences/selectors';
import { READER_AS_LANDING_PAGE_PREFERENCE } from './has-reader-as-landing-page';
import type { AppState } from 'calypso/types';

export const SITES_AS_LANDING_PAGE_PREFERENCE = 'sites-landing-page';

export const hasSitesAsLandingPage = ( state: AppState ): boolean => {
	const { useReaderAsLandingPage } = getPreference( state, READER_AS_LANDING_PAGE_PREFERENCE );
	if ( useReaderAsLandingPage ) {
		return useReaderAsLandingPage;
	}
	const { useSitesAsLandingPage } = getPreference( state, SITES_AS_LANDING_PAGE_PREFERENCE );
	if ( useSitesAsLandingPage ) {
		return useSitesAsLandingPage;
	}
	return false;
};
