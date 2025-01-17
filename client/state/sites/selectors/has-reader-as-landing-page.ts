import { getPreference } from 'calypso/state/preferences/selectors';
import type { AppState } from 'calypso/types';

export const READER_AS_LANDING_PAGE_PREFERENCE = 'reader-landing-page';

export const READER_AS_LANDING_PAGE_DEFAULT_VALUE = {
	useReaderAsLandingPage: false,
	updatedAt: 0,
};

export const hasReadersAsLandingPage = ( state: AppState ): boolean => {
	const { useReadersAsLandingPage } =
		getPreference( state, READER_AS_LANDING_PAGE_PREFERENCE ) ??
		READER_AS_LANDING_PAGE_DEFAULT_VALUE;

	return useReadersAsLandingPage;
};
