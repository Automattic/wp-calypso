/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

/**
 * The newsletters step title
 */
const NewslettersStep: Step = function NewslettersStep( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName={ 'newsletters' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <h1>Newsletters</h1> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default NewslettersStep;
