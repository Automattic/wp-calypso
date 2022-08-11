import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const NewsletterAddSubscribers: Step = function NewsletterAddSubscribers() {
	return (
		<StepContainer
			stepName={ 'newsletterAddSubscribers' }
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			isHorizontalLayout={ true }
			stepContent={ <h1>Newsletter Add Subscribers</h1> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default NewsletterAddSubscribers;
