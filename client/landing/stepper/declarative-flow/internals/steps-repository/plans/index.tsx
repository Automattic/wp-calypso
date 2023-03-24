import { is2023PricingGridActivePage } from '@automattic/calypso-products';
import { DOMAIN_UPSELL_FLOW, StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { ProvidedDependencies, Step } from '../../types';

const plans: Step = function Plans( { navigation, flow } ) {
	const { submit, goBack } = navigation;

	const handleSubmit = () => {
		const providedDependencies: ProvidedDependencies = {};

		if ( flow === DOMAIN_UPSELL_FLOW ) {
			providedDependencies.goToCheckout = true;
		}

		submit?.( providedDependencies );
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
