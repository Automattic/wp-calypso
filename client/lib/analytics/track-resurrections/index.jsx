import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	RESURRECTED_EVENT,
	RESURRECTED_EVENT_3M,
	RESURRECTED_EVENT_6M,
	RESURRECTION_DAY_LIMIT_3M,
	RESURRECTION_DAY_LIMIT_DEFAULT,
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
} from 'calypso/lib/resurrected-users/constants';
import { hasExceededDormancyThreshold } from 'calypso/lib/resurrected-users/utils';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

const TrackResurrections = () => {
	const userSettings = useSelector( getUserSettings ) || {};
	const lastSeen = userSettings.last_admin_activity_timestamp || Math.floor( Date.now() / 1000 );

	const isFetching = useSelector( isFetchingUserSettings );
	const isResurrectedDefault = hasExceededDormancyThreshold(
		lastSeen,
		RESURRECTION_DAY_LIMIT_DEFAULT
	);
	const isResurrectedSixMonths = hasExceededDormancyThreshold(
		lastSeen,
		RESURRECTION_DAY_LIMIT_EXPERIMENT
	);
	const isResurrectedThreeMonths = hasExceededDormancyThreshold(
		lastSeen,
		RESURRECTION_DAY_LIMIT_3M
	);

	useEffect( () => {
		if ( isFetching ) {
			return;
		}
		if ( isResurrectedDefault ) {
			recordTracksEvent( RESURRECTED_EVENT, {
				last_seen: lastSeen,
				day_limit: RESURRECTION_DAY_LIMIT_DEFAULT,
			} );
		}
		if ( isResurrectedSixMonths ) {
			recordTracksEvent( RESURRECTED_EVENT_6M, {
				last_seen: lastSeen,
				day_limit: RESURRECTION_DAY_LIMIT_EXPERIMENT,
			} );
		}
		if ( isResurrectedThreeMonths ) {
			recordTracksEvent( RESURRECTED_EVENT_3M, {
				last_seen: lastSeen,
				day_limit: RESURRECTION_DAY_LIMIT_3M,
			} );
		}
	}, [
		isFetching,
		isResurrectedDefault,
		isResurrectedSixMonths,
		isResurrectedThreeMonths,
		lastSeen,
	] ); // Only run this when LastSeen value changes.

	return null;
};

export default TrackResurrections;
