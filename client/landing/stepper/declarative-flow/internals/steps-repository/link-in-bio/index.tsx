/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

/**
 * The link in bio step title
 */
const LinkInBioSteps: Step = function LinkInBioSteps( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName={ 'link-in-bio' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <h1>Link In Bio</h1> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LinkInBioSteps;
