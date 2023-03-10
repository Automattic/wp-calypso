import { is2023PricingGridActivePage } from '@automattic/calypso-products';
import { DOMAIN_UPSELL_FLOW, StepContainer } from '@automattic/onboarding';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { ProvidedDependencies, Step } from '../../types';

const plans: Step = function Plans( { navigation, flow } ) {
	const { submit, goBack } = navigation;

	const siteSlug = useQuery().get( 'siteSlug' );

	const handleSubmit = () => {
		const providedDependencies: ProvidedDependencies = {};

		if ( flow === DOMAIN_UPSELL_FLOW ) {
			providedDependencies.goToCheckout = true;
			providedDependencies.siteSlug = siteSlug;
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
