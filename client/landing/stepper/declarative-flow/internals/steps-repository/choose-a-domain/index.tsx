/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const ChooseADomain: Step = function ChooseADomain( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName="chooseADomain"
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <h1>Choose a domain step</h1> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ChooseADomain;
