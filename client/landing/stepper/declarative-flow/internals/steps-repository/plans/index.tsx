import { is2023PricingGridActivePage } from '@automattic/calypso-products';
import {
	isBlogOnboardingFlow,
	isDomainUpsellFlow,
	isNewHostedSiteCreationFlow,
	StepContainer,
} from '@automattic/onboarding';
import { useSelector } from 'react-redux';
import { isInHostingFlow } from 'calypso/landing/stepper/utils/is-in-hosting-flow';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { ProvidedDependencies, Step } from '../../types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const plans: Step = function Plans( { navigation, flow } ) {
	const hostingFlow = useSelector( isInHostingFlow );
	const { goBack, submit } = navigation;

	const handleSubmit = ( plan: MinimalRequestCartProduct | null ) => {
		const providedDependencies: ProvidedDependencies = {
			plan,
		};

		if ( isDomainUpsellFlow( flow ) || isBlogOnboardingFlow( flow ) ) {
			providedDependencies.goToCheckout = true;
		}

		submit?.( providedDependencies );
	};
	const is2023PricingGridVisible = is2023PricingGridActivePage( window );

	const isAllowedToGoBack =
		isDomainUpsellFlow( flow ) || ( isNewHostedSiteCreationFlow( flow ) && hostingFlow );

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
