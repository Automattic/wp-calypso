import { DefaultInterface } from 'calypso/me/account/types';
import { useSelector } from 'calypso/state';
import {
	getPreference,
	isFetchingPreferences,
	isSavingPreference,
} from 'calypso/state/preferences/selectors';

export default function useGetDefaultInterface() {
	const isReady = useSelector(
		( state ) => ! isSavingPreference( state ) && ! isFetchingPreferences( state )
	);

	const { sitesAsLandingPage, readerAsLandingPage } = useSelector( ( state ) => ( {
		sitesAsLandingPage: getPreference( state, 'sites-landing-page' )?.useSitesAsLandingPage,
		readerAsLandingPage: getPreference( state, 'reader-landing-page' )?.useReaderAsLandingPage,
	} ) );

	if ( ! isReady ) {
		return null;
	}

	if ( readerAsLandingPage ) {
		return DefaultInterface.READER;
	}

	if ( sitesAsLandingPage ) {
		return DefaultInterface.SITES;
	}

	return DefaultInterface.PRIMARY_SITE;
}
