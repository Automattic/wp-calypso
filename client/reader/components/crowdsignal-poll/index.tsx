import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserDate } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { isA8cTeamMember } from 'calypso/state/teams/selectors';
import ErrorBoundary from './error-boundary';
import CrowdsignalPollComponent from './main';

import './style.scss';

const READER_CROWDSIGNAL_POLL_VIEWED_PREFERENCE = 'reader-crowdsignal-poll-viewed';
const REGISTRATION_CUTOFF_DATE = new Date( '2025-01-01T00:00:00Z' );

const CrowdsignalPoll = () => {
	const dispatch = useDispatch();

	const remotePrefsLoaded = useSelector( hasReceivedRemotePreferences );
	const isAutomattician = useSelector( isA8cTeamMember );
	const userRegistrationDate = useSelector( getCurrentUserDate );
	const hasViewedPollPref = useSelector( ( state ): boolean | undefined | null =>
		getPreference( state, READER_CROWDSIGNAL_POLL_VIEWED_PREFERENCE )
	);
	const hasViewedPoll = useRef( hasViewedPollPref ); // Show the poll when the component first mounts, but not subsequently

	const shouldNotRender =
		( remotePrefsLoaded && hasViewedPoll.current ) ||
		new Date( userRegistrationDate ) < REGISTRATION_CUTOFF_DATE ||
		isAutomattician;

	useEffect( () => {
		if ( ! hasViewedPoll.current ) {
			dispatch( savePreference( READER_CROWDSIGNAL_POLL_VIEWED_PREFERENCE, true ) );
		}
	}, [ dispatch ] );

	if ( shouldNotRender ) {
		return null;
	}

	return (
		<ErrorBoundary>
			<CrowdsignalPollComponent />
		</ErrorBoundary>
	);
};

export default CrowdsignalPoll;
