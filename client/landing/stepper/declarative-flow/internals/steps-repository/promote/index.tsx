import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PromoteStep from './promote';
import type { Step } from '../../types';

const Promote: Step = function Promote( { navigation, flow } ) {
	const { goNext, goBack } = navigation;

	const handleGetStarted = () => {
		// needs to be implemented
		goNext();
	};
	return (
		<StepContainer
			stepName={ 'promote' }
			goBack={ goBack }
			isHorizontalLayout={ false }
			// isWideLayout={ true }
			// isLargeSkipLayout={ false }
			stepContent={ <PromoteStep flowName={ flow } goNext={ handleGetStarted } /> }
			recordTracksEvent={ recordTracksEvent }
			// showJetpackPowered
		/>
	);
};

export default Promote;
