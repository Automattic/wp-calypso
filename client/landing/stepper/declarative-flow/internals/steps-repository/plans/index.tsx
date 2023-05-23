import { is2023PricingGridActivePage } from '@automattic/calypso-products';
import {
	isDesignFirstFlow,
	isDomainUpsellFlow,
	isHostingSiteCreationFlow,
	isStartWritingFlow,
	StepContainer,
} from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { ProvidedDependencies, Step } from '../../types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const plans: Step = function Plans( { navigation, flow } ) {
	const { goBack, submit } = navigation;

	const handleSubmit = ( plan: MinimalRequestCartProduct | null ) => {
		const providedDependencies: ProvidedDependencies = {
			plan,
		};

		if ( isDomainUpsellFlow( flow ) || isStartWritingFlow( flow ) || isDesignFirstFlow( flow ) ) {
			providedDependencies.goToCheckout = true;
		}

		submit?.( providedDependencies );
	};
	const is2023PricingGridVisible = is2023PricingGridActivePage( window );

	const isAllowedToGoBack = isDomainUpsellFlow( flow ) || isHostingSiteCreationFlow( flow );

	return (
		<StepContainer
			stepName="plans"
			goBack={ goBack }
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
