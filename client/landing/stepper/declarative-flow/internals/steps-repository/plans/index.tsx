import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { Step } from '../../types';

const plans: Step = function plans( { navigation, flow } ) {
	const { submit, goBack } = navigation;

	const handleSubmit = () => {
		submit?.();
	};

	return (
		<StepContainer
			stepName="plans"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			hideFormattedHeader={ true }
			isLargeSkipLayout={ false }
			hideBack={ true }
			stepContent={ <PlansWrapper flowName={ flow } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
