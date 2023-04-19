import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

const YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

const isResurrected = ( lastSeen ) => {
	// Get the current timestamp in seconds
	const nowInSeconds = Math.floor( Date.now() / 1000 );

	// Calculate the timestamp for one year ago in seconds
	const oneYearAgoInSeconds = nowInSeconds - YEAR_IN_SECONDS;

	// Compare the given timestamp with one year ago
	return lastSeen < oneYearAgoInSeconds;
};

const TrackResurrections = () => {
	const userSettings = useSelector( getUserSettings ) ?? {};
	const lastSeen = userSettings?.last_admin_activity_timestamp || Date.now();

	const isFetching = useSelector( isFetchingUserSettings );

	useEffect( () => {
		if ( isFetching ) {
			return;
		}
		if ( ! isResurrected( lastSeen ) ) {
			return;
		}
		recordTracksEvent( 'calypso_user_resurrected', {
			last_seen: lastSeen,
		} );
	}, [ lastSeen ] ); // Only run this when LastSeen value changes.

	return null;
};

export default TrackResurrections;
