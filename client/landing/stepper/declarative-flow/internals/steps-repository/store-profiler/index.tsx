/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const StoreProfilerStep: Step = function StoreProfilerStep( { navigation } ) {
	const { goBack } = navigation;

	const StoreProfilerStepContent: React.FC = () => {
		return <p>Store Profiler Content TBA</p>;
	};

	return (
		<StepContainer
			stepName="store-profiler-step"
			goBack={ goBack }
			hideBack
			isFullLayout
			stepContent={ <StoreProfilerStepContent /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default StoreProfilerStep;
