import { Onboard } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';

const SiteIntent = Onboard.SiteIntent;

export function useProcessingLoadingMessages() {
	const { __ } = useI18n();
	let loadingMessages = [];

	const stepData = useSelect( ( select ) => select( STEPPER_INTERNAL_STORE ).getStepData() );
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
