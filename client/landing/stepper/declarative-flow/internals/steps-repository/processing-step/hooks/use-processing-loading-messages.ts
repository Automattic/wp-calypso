import { Onboard } from '@automattic/data-stores';
import { isWooExpressFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';

const SiteIntent = Onboard.SiteIntent;

export function useProcessingLoadingMessages( flow?: string | null ) {
	const { __ } = useI18n();
	let loadingMessages = [];

	const stepData = useSelect( ( select ) => select( STEPPER_INTERNAL_STORE ).getStepData() );

	if ( flow === 'copy-site' ) {
		return [
			{ title: __( 'Laying the foundations' ), duration: 3500 },
			{ title: __( 'Securing your data' ), duration: 4500 },
			{ title: __( 'Enabling encryption' ), duration: 5000 },
			{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
		];
	}

	if ( isWooExpressFlow( flow ) ) {
		return stepData.currentStep === 'siteCreationStep'
			? [
					{
						title: __( 'Woo! We’re creating your store' ),
						subtitle: __(
							'#FunWooFact: Did you know that Woo powers almost 4 million stores worldwide? You’re in good company.'
						),
						duration: 1000,
					},
			  ]
			: [
					{
						title: __( 'Applying the finishing touches' ),
						subtitle: __(
							'#FunWooFact: There are more than 150 WooCommerce meetups held all over the world! A great way to meet fellow store owners.'
						),
						duration: 6000,
					},
					{
						title: __( 'Turning on the lights' ),
						subtitle: __( '#FunWooFact: Our favorite color is purple 💜' ),
						// Set a very long duration to make sure it shows until the step is completed
						duration: 60000,
					},
			  ];
	}

	switch ( stepData.intent ) {
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
