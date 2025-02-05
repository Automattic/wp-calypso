import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

export const READER_AS_LANDING_PAGE_PREFERENCE = 'reader-landing-page';

export const hasReadersAsLandingPage = ( state: AppState ): boolean => {
	const preference = getPreference( state, READER_AS_LANDING_PAGE_PREFERENCE ) || {};
	const { useReaderAsLandingPage = false } = preference;
	return !! useReaderAsLandingPage;
};

export const saveReaderAsLandingPage = () => ( dispatch: CalypsoDispatch ) => {
	return dispatch(
		savePreference( READER_AS_LANDING_PAGE_PREFERENCE, {
			useReaderAsLandingPage: true,
			updatedAt: Date.now(),
		} )
	);
};
