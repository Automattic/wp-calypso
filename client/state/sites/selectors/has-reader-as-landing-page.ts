import { getPreference } from 'calypso/state/preferences/selectors';
import { SITES_AS_LANDING_PAGE_PREFERENCE } from './has-sites-as-landing-page';
import type { AppState } from 'calypso/types';

export const READER_AS_LANDING_PAGE_PREFERENCE = 'reader-landing-page';

export const hasReadersAsLandingPage = ( state: AppState ): boolean => {
	const { useSitesAsLandingPage } = getPreference( state, SITES_AS_LANDING_PAGE_PREFERENCE );
	if ( useSitesAsLandingPage ) {
		return useSitesAsLandingPage;
	}
	const { useReaderAsLandingPage } = getPreference( state, READER_AS_LANDING_PAGE_PREFERENCE );
	if ( useReaderAsLandingPage ) {
		return useReaderAsLandingPage;
	}
	return false;
};
