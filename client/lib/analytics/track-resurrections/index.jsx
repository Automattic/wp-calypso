import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	RESURRECTED_EVENT,
	RESURRECTED_EVENT_6M,
	RESURRECTED_EVENT_3M,
	RESURRECTION_DAY_LIMIT_DEFAULT,
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
	RESURRECTION_DAY_LIMIT_EXPERIMENT2,
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
	const isRessurectedThreeMonths = hasExceededDormancyThreshold(
		lastSeen,
		RESURRECTION_DAY_LIMIT_EXPERIMENT2
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
		if ( isRessurectedThreeMonths ) {
			recordTracksEvent( RESURRECTED_EVENT_3M, {
				last_seen: lastSeen,
				day_limit: RESURRECTION_DAY_LIMIT_EXPERIMENT2,
			} );
		}
	}, [ isFetching, isResurrectedDefault, isResurrectedSixMonths, lastSeen ] ); // Only run this when LastSeen value changes.

	return null;
};

export default TrackResurrections;
