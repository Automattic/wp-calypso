import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

const RESURRECTION_POLICY = 373; // Number of days that constitute a resurrection.
const POLICY_IN_SECONDS = RESURRECTION_POLICY * 24 * 60 * 60;

const isResurrected = ( lastSeen ) => {
	// Get the current timestamp in seconds
	const nowInSeconds = Math.floor( Date.now() / 1000 );

	// Calculate the timestamp for a point in time beyond which a dormant user is considered resurrected.
	const resurrectionThreshold = nowInSeconds - POLICY_IN_SECONDS;

	// Consider a user resurrected if they were last seen at a time later than the resurrection threshold.
	return lastSeen < resurrectionThreshold;
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
			policy: RESURRECTION_POLICY,
		} );
	}, [ lastSeen ] ); // Only run this when LastSeen value changes.

	return null;
};

export default TrackResurrections;
