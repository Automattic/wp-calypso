import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

const RESURRECTION_DAY_LIMIT = 373; // A user is considered resurrected if they have not been seen for at least these number of days.
const RESURRECTION_DAY_LIMIT_IN_SECONDS = RESURRECTION_DAY_LIMIT * 24 * 60 * 60;

const isResurrected = ( lastSeen ) => {
	// Get the current timestamp in seconds
	const nowInSeconds = Math.floor( Date.now() / 1000 );

	// This constant defines the timestamp for a point in time beyond which a formally dormant user is considered resurrected.
	const lastSeenThreshold = nowInSeconds - RESURRECTION_DAY_LIMIT_IN_SECONDS;

	// Consider a user resurrected if they were last seen at a time later than the lastSeen threshold.
	return lastSeen < lastSeenThreshold;
};

const TrackResurrections = () => {
	const userSettings = useSelector( getUserSettings ) || {};
	const lastSeen = userSettings.last_admin_activity_timestamp || Math.floor( Date.now() / 1000 );

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
			day_limit: RESURRECTION_DAY_LIMIT,
		} );
	}, [ lastSeen ] ); // Only run this when LastSeen value changes.

	return null;
};

export default TrackResurrections;
