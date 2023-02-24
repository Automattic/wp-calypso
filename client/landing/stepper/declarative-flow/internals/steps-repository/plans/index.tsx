import { is2023PricingGridActivePage } from '@automattic/calypso-products';
import { StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { Step } from '../../types';

const plans: Step = function plans( { navigation, flow } ) {
	const { submit, goBack } = navigation;

	const handleSubmit = () => {
		submit?.();
	};
	const is2023PricingGridVisible = is2023PricingGridActivePage( window );
	return (
		<StepContainer
			stepName="plans"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ ! is2023PricingGridVisible }
			isFullLayout={ is2023PricingGridVisible }
			hideFormattedHeader={ true }
			isLargeSkipLayout={ false }
			hideBack={ true }
			stepContent={ <PlansWrapper flowName={ flow } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
