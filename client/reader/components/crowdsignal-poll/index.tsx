import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { isA8cTeamMember } from 'calypso/state/teams/selectors';
import ErrorBoundary from './error-boundary';
import CrowdsignalPollComponent from './main';

import './style.scss';

const READER_CROWDSIGNAL_POLL_VIEWED_PREFERENCE = 'reader-crowdsignal-poll-viewed';

const CrowdsignalPoll = () => {
	const dispatch = useDispatch();

	const isAutomattician = useSelector( isA8cTeamMember );
	const hasViewedPollPref = useSelector( ( state ): boolean | undefined | null =>
		getPreference( state, READER_CROWDSIGNAL_POLL_VIEWED_PREFERENCE )
	);
	const hasViewedPoll = useRef( hasViewedPollPref ); // Show the poll when the component first mounts, but not subsequently

	useEffect( () => {
		if ( ! hasViewedPoll.current ) {
			dispatch( savePreference( READER_CROWDSIGNAL_POLL_VIEWED_PREFERENCE, true ) );
		}
	}, [ dispatch ] );

	if ( hasViewedPoll.current || isAutomattician ) {
		return null;
	}

	return (
		<ErrorBoundary>
			<CrowdsignalPollComponent />
		</ErrorBoundary>
	);
};

export default CrowdsignalPoll;
