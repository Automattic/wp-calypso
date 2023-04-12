import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

const TrackResurrections = () => {
	const YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

	const isResurrected = ( lastSeen ) => {
		// Get the current timestamp in seconds
		const nowInSeconds = Math.floor( Date.now() / 1000 );

		// Calculate the timestamp for one year ago in seconds
		const oneYearAgoInSeconds = nowInSeconds - YEAR_IN_SECONDS;

		// Compare the given timestamp with one year ago
		return lastSeen < oneYearAgoInSeconds;
	};

	const userSettings = useSelector( getUserSettings ) ?? {};
	const isFetching = useSelector( isFetchingUserSettings );

	useEffect( () => {
		if ( isFetching ) {
			return null;
		}

		const lastSeen = userSettings?.last_admin_activity_timestamp || Date.now();

		if ( ! isResurrected( lastSeen ) ) {
			return;
		}

		recordTracksEvent( 'calypso_user_resurrected', {
			lastSeen,
		} );
	}, [] ); // We want this to only fire once.

	return null;
};

export default TrackResurrections;
