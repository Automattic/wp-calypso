import { getPreference } from 'calypso/state/preferences/selectors';
import type { AppState } from 'calypso/types';

export const READER_AS_LANDING_PAGE_PREFERENCE = 'reader-landing-page';

export const hasReadersAsLandingPage = ( state: AppState ): boolean => {
	const { useReaderAsLandingPage = false } = getPreference(
		state,
		READER_AS_LANDING_PAGE_PREFERENCE
	);
	if ( useReaderAsLandingPage ) {
		return useReaderAsLandingPage;
	}
	return false;
};
