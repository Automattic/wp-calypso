import { useSelector } from 'calypso/state';
import { isA8cTeamMember } from 'calypso/state/teams/selectors';
import ErrorBoundary from './error-boundary';
import CrowdsignalPollComponent from './main';

import './style.scss';

const CrowdsignalPoll = () => {
	const isAutomattician = useSelector( isA8cTeamMember );

	if ( isAutomattician ) {
		return null;
	}

	return (
		<ErrorBoundary>
			<CrowdsignalPollComponent />
		</ErrorBoundary>
	);
};

export default CrowdsignalPoll;
