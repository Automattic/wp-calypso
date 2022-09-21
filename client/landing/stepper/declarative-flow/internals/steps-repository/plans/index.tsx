// import { NEWSLETTER_FLOW } from '@automattic/onboarding';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { Step } from '../../types';

const PlansLinkInBio: Step = function PlansLinkInBio( { navigation } ) {
	const { submit, goBack } = navigation;

	const handleSubmit = () => {
		submit?.();
	};

	return (
		<StepContainer
			stepName={ 'plans-link-in-bio' }
			className={ 'test' }
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <PlansWrapper onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			// showJetpackPowered={ flow === NEWSLETTER_FLOW }
		/>
	);
};

export default PlansLinkInBio;
