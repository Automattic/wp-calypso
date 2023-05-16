import { is2023PricingGridActivePage } from '@automattic/calypso-products';
import {
	DOMAIN_UPSELL_FLOW,
	isHostingSiteCreationFlow,
	START_WRITING_FLOW,
	StepContainer,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { ProvidedDependencies, Step } from '../../types';

const plans: Step = function Plans( { navigation, flow } ) {
	const { submit } = navigation;

	const handleSubmit = ( plan: MinimalRequestCartProduct | null ) => {
		const providedDependencies: ProvidedDependencies = {
			plan,
		};

		if ( flow === DOMAIN_UPSELL_FLOW || flow === START_WRITING_FLOW ) {
			providedDependencies.goToCheckout = true;
		}

		submit?.( providedDependencies );
	};
	const is2023PricingGridVisible = is2023PricingGridActivePage( window );

	const isAllowedToGoBack = flow === DOMAIN_UPSELL_FLOW || isHostingSiteCreationFlow( flow );

	return (
		<StepContainer
			stepName="plans"
			goBack={ () => submit?.( { goBack: true } ) }
			isHorizontalLayout={ false }
			isWideLayout={ ! is2023PricingGridVisible }
			isFullLayout={ is2023PricingGridVisible }
			hideFormattedHeader={ true }
			isLargeSkipLayout={ false }
			hideBack={ ! isAllowedToGoBack }
			stepContent={
				<PlansWrapper
					flowName={ flow }
					onSubmit={ handleSubmit }
					is2023PricingGridVisible={ is2023PricingGridVisible }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
