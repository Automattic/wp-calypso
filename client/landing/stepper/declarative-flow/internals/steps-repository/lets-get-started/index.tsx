/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const LetsGetStarted: Step = function LetsGetStarted( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName="letsGetStarted"
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout
			isLargeSkipLayout={ false }
			stepContent={ <h1>Let's get started step</h1> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LetsGetStarted;
