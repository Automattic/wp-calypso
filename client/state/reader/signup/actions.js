import { savePreference } from 'calypso/state/preferences/actions';
import { READER_AS_LANDING_PAGE_PREFERENCE } from 'calypso/state/sites/selectors/has-reader-as-landing-page';

export const setReaderAsLandingPage = () => ( dispatch ) => {
	console.log( 'dispatched I said' );
	return dispatch(
		savePreference( READER_AS_LANDING_PAGE_PREFERENCE, {
			useReaderAsLandingPage: true,
			updatedAt: Date.now(),
		} )
	);
};
