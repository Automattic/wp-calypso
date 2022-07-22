/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

/**
 * The podcasts step title
 */
const PodcastsStep: Step = function PodcastsStep( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName={ 'podcasts' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <h1>Podcasts</h1> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastsStep;
