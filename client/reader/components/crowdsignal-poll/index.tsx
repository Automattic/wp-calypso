import ErrorBoundary from './error-boundary';
import CrowdsignalPollComponent from './main';

const CrowdsignalPoll = () => (
	<ErrorBoundary>
		<CrowdsignalPollComponent />
	</ErrorBoundary>
);

export default CrowdsignalPoll;
