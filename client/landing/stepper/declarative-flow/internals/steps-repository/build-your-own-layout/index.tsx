import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const BuildYourOwnLayout: Step = function BuildYourOwnLayout( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName={ 'buildYourOwnLayout' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			hideSkip={ true }
			stepContent={ <></> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default BuildYourOwnLayout;
