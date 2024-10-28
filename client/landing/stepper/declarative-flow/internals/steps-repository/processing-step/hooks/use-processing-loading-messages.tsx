import { Onboard } from '@automattic/data-stores';
import {
	isWooExpressFlow,
	isNewHostedSiteCreationFlow,
	isTransferringHostedSiteCreationFlow,
	VIDEOPRESS_FLOW,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import WooPurpleHeart from 'calypso/assets/images/onboarding/woo-purple-heart.png';
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

	if ( isWooExpressFlow( flow || null ) ) {
		switch ( stepData?.currentStep ) {
			case 'createSite':
				return [
					{
						title: __( "Woo! We're creating your store" ),
						subtitle: (
							<>
								<strong>{ __( 'Hang tight!' ) }</strong>
								{ __( 'Your free trial is currently being set up and may take a few minutes.' ) }
							</>
						),
						duration: 15000,
					},
				];
			case 'waitForAtomic':
				return [
					{
						title: __( 'Building the foundations' ),
						subtitle: (
							<>
								<strong>{ __( '#FunWooFact:' ) }</strong>
								{ __(
									'Did you know that Woo was founded by two South Africans and a Norwegian? Here are three alternative ways to say "store" in those countries - Winkel, ivenkile, and butikk.'
								) }
							</>
						),
						duration: 8000,
					},
					{
						title: __( 'Organizing the stock room' ),
						subtitle: (
							<>
								<strong>{ __( '#FunWooFact:' ) }</strong>
								{ __(
									"Did you know that Woo powers almost 4 million stores worldwide? You're in good company."
								) }
							</>
						),
						duration: 6000,
					},
					{
						title: __( 'Organizing the stock room' ),
						subtitle: (
							<>
								<strong>{ __( '#FunWooFact:' ) }</strong>
								{ __( 'Are you Team Cat or Team Dog? The Woo team is split 50/50!' ) }
							</>
						),
						duration: 6000,
					},
					{
						title: __( 'Applying the finishing touches' ),
						subtitle: (
							<>
								<strong>{ __( '#FunWooFact:' ) }</strong>
								{ __(
									'There are more than 150 Woo meetups held all over the world! A great way to meet fellow store owners.'
								) }
							</>
						),
						duration: 8000,
					},
					{
						title: __( 'Turning on the lights' ),
						subtitle: (
							<>
								<strong>{ __( '#FunWooFact:' ) }</strong>
								{ __(
									'The Woo team is made up of over 350 talented individuals, distributed across 30+ countries.'
								) }
							</>
						),
						duration: 8000,
					},
					{
						title: __( 'Turning on the lights' ),
						subtitle: (
							<>
								<strong>{ __( '#FunWooFact:' ) }</strong>
								{ __( 'Our favorite color is purple' ) }
								<img
									className="woo-inline-purple-heart"
									alt="Woo Purple Heart Emoji"
									src={ WooPurpleHeart }
								/>
							</>
						),
						// Set a very long duration to make sure it shows until the step is completed
						duration: 150000,
					},
				];
			default:
				return [
					{
						title: __( 'Opening the doors' ),
						subtitle: (
							<>
								<strong>{ __( "We're almost there!" ) }</strong>
								{ __( 'Your free trial will be ready in just a moment.' ) }
							</>
						),
						// Set a very long duration to make sure it shows until the step is completed
						duration: 150000,
					},
				];
		}
	} else if ( VIDEOPRESS_FLOW === flow ) {
		const videoPressLoadingMessages = [
			{ title: __( 'Setting up your video site' ), duration: 5000 },
			{ title: __( 'Scouting the locations' ), duration: 5000 },
			{ title: __( 'Kicking off the casting' ), duration: 5000 },
			{ title: __( "Let's head to the checkout" ), duration: 5000 },
		];
		return videoPressLoadingMessages;
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
