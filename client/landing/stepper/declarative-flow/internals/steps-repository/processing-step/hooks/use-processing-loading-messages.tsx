import { Onboard } from '@automattic/data-stores';
import {
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

	if ( flow && isTransferringHostedSiteCreationFlow( flow ) ) {
		return [
			{ title: __( 'Laying the foundations' ), duration: 5000 },
			{ title: __( 'Warming up CPUs' ), duration: 3000 },
			{ title: __( 'Installing WordPress' ), duration: 3000 },
			{ title: __( 'Securing your data' ), duration: 5000 },
			{ title: __( 'Distributing your site worldwide' ), duration: 5000 },
			{ title: __( 'Closing the loop' ), duration: Infinity },
		];
	}

	if ( flow === 'copy-site' ) {
		return [
			{ title: __( 'Laying the foundations' ), duration: 3500 },
			{ title: __( 'Securing your data' ), duration: 4500 },
			{ title: __( 'Enabling encryption' ), duration: 5000 },
			{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
		];
	}

	switch ( stepData?.intent ) {
		case SiteIntent.DIFM:
			loadingMessages = [
				{ title: __( 'Securing your data' ), duration: 5000 },
				{ title: __( 'Enabling encryption' ), duration: 3000 },
				{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
				{ title: __( 'Closing the loop' ), duration: 4000 },
			];
			break;
		case SiteIntent.Sell:
			loadingMessages = [
				{ title: __( 'Sprinkling some magic' ), duration: 4000 },
				{ title: __( 'Securing your data' ), duration: 5000 },
				{ title: __( 'Enabling encryption' ), duration: 3000 },
				{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
				{ title: __( 'Closing the loop' ), duration: 5000 },
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
			];
			break;
	}

	return loadingMessages;
}
