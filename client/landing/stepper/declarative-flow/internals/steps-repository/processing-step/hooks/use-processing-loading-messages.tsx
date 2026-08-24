import { Onboard } from '@automattic/data-stores';
import {
	isAIBuilderOnboardingFlow,
	isNewHostedSiteCreationFlow,
	isTransferringHostedSiteCreationFlow,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import type { LoadingMessage } from './types';
import type { StepperInternalSelect } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

export function useProcessingLoadingMessages( flow?: string | null ): LoadingMessage[] {
	const { __ } = useI18n();
	let loadingMessages = [];

	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);

	if ( flow && isNewHostedSiteCreationFlow( flow ) ) {
		return [ { title: __( 'Creating your site' ), duration: Infinity } ];
	}

	// The AI build happens after the user reaches the AI Website Builder, so
	// avoid the default messages that imply the site is being designed here.
	if ( flow && isAIBuilderOnboardingFlow( flow ) ) {
		return [
			{ title: __( 'Getting things ready' ), duration: 4000 },
			{ title: __( 'Waking up the website builder' ), duration: 5000 },
			{ title: __( 'Heading to checkout' ), duration: Infinity },
		];
	}

	if ( flow && isTransferringHostedSiteCreationFlow( flow ) ) {
		return [
			{ title: __( 'Preparing your new server' ), duration: 14000 },
			{ title: __( 'Installing WordPress' ), duration: 6000 },
			{ title: __( 'Copying your site' ), duration: 9000 },
			{ title: __( 'Securing your connection' ), duration: 5000 },
			{ title: __( 'Distributing your site worldwide' ), duration: 6000 },
			{ title: __( 'Finishing up — this can take a few minutes' ), duration: Infinity },
		];
	}

	if ( flow === 'copy-site' ) {
		return [
			{ title: __( 'Laying the foundations' ), duration: 3500 },
			{ title: __( 'Securing your data' ), duration: 4500 },
			{ title: __( 'Enabling encryption' ), duration: 5000 },
			{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
			{ title: __( 'Finishing up — this can take a few minutes' ), duration: Infinity },
		];
	}

	switch ( stepData?.intent ) {
		case SiteIntent.DIFM:
			loadingMessages = [
				{ title: __( 'Securing your data' ), duration: 5000 },
				{ title: __( 'Enabling encryption' ), duration: 3000 },
				{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
				{ title: __( 'Closing the loop' ), duration: 4000 },
				{ title: __( 'Finishing up — this can take a few minutes' ), duration: Infinity },
			];
			break;
		case SiteIntent.Sell:
			loadingMessages = [
				{ title: __( 'Sprinkling some magic' ), duration: 4000 },
				{ title: __( 'Securing your data' ), duration: 5000 },
				{ title: __( 'Enabling encryption' ), duration: 3000 },
				{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
				{ title: __( 'Closing the loop' ), duration: 5000 },
				{ title: __( 'Finishing up — this can take a few minutes' ), duration: Infinity },
			];
			break;
		default:
			loadingMessages = [
				{ title: __( 'Laying the foundations' ), duration: 2000 },
				{ title: __( 'Turning on the lights' ), duration: 3000 },
				{ title: __( 'Making it beautiful' ), duration: 2000 },
				{ title: __( 'Personalizing your site' ), duration: 4000 },
				{ title: __( 'Sprinkling some magic' ), duration: 4000 },
				{ title: __( 'Securing your data' ), duration: 5000 },
				{ title: __( 'Enabling encryption' ), duration: 3000 },
				{ title: __( 'Optimizing your content' ), duration: 6000 },
				{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
				{ title: __( 'Closing the loop' ), duration: 5000 },
				{ title: __( 'Finishing up — this can take a few minutes' ), duration: Infinity },
			];
			break;
	}

	return loadingMessages;
}
