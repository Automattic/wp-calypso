import {
	isBlogOnboardingFlow,
	isDomainUpsellFlow,
	isNewHostedSiteCreationFlow,
	isOnboardingFlow,
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

		if ( isDomainUpsellFlow( flow ) || isBlogOnboardingFlow( flow ) || isOnboardingFlow( flow ) ) {
			providedDependencies.goToCheckout = true;
		}

		submit?.( providedDependencies );
	};

	const isAllowedToGoBack = isDomainUpsellFlow( flow ) || isNewHostedSiteCreationFlow( flow );

	return (
		<StepContainer
			stepName="plans"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ false }
			isFullLayout={ true }
			hideFormattedHeader={ true }
			isLargeSkipLayout={ false }
			hideBack={ ! isAllowedToGoBack }
			stepContent={ <PlansWrapper flowName={ flow } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
