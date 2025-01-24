import ErrorBoundary from './error-boundary';
import CrowdsignalPollComponent from './main';

import './style.scss';

const CrowdsignalPoll = () => (
	<ErrorBoundary>
		<CrowdsignalPollComponent />
	</ErrorBoundary>
);

export default CrowdsignalPoll;
