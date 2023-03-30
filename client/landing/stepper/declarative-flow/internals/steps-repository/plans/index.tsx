import { is2023PricingGridActivePage } from '@automattic/calypso-products';
import { DOMAIN_UPSELL_FLOW, StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { ProvidedDependencies, Step } from '../../types';

const plans: Step = function Plans( { navigation, flow } ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		const providedDependencies: ProvidedDependencies = {};

		if ( flow === DOMAIN_UPSELL_FLOW ) {
			providedDependencies.goToCheckout = true;
		}

		submit?.( providedDependencies );
	};
	const is2023PricingGridVisible = is2023PricingGridActivePage( window );

	const handleGoBack = () => {
		if ( flow === DOMAIN_UPSELL_FLOW ) {
			submit?.( { returnToDomainSelection: true } );
		}
	};

	const getBackLabelText = () => {
		if ( flow === DOMAIN_UPSELL_FLOW ) {
			return __( 'Back' );
		}
	};

	const shouldHideBackButton = () => {
		if ( flow === DOMAIN_UPSELL_FLOW ) {
			return false;
		}
		return true;
	};

	return (
		<StepContainer
			stepName="plans"
			goBack={ handleGoBack }
			isHorizontalLayout={ false }
			isWideLayout={ ! is2023PricingGridVisible }
			isFullLayout={ is2023PricingGridVisible }
			hideFormattedHeader={ true }
			isLargeSkipLayout={ false }
			backLabelText={ getBackLabelText() }
			hideBack={ shouldHideBackButton() }
			stepContent={ <PlansWrapper flowName={ flow } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
