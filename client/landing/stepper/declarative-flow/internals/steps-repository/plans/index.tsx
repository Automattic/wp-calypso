import {
	isBlogOnboardingFlow,
	isDomainUpsellFlow,
	isNewHostedSiteCreationFlow,
	isOnboardingPMFlow,
	StepContainer,
} from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSitesDashboardImportSiteUrl } from 'calypso/sites-dashboard/hooks/use-sites-dashboard-import-site-url';
import PlansWrapper from './plans-wrapper';
import type { ProvidedDependencies, Step } from '../../types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const plans: Step = function Plans( { navigation, flow } ) {
	const { __ } = useI18n();
	const { goBack, submit } = navigation;

	const handleSubmit = ( plan: MinimalRequestCartProduct | null ) => {
		const providedDependencies: ProvidedDependencies = {
			plan,
		};

		if (
			isDomainUpsellFlow( flow ) ||
			isBlogOnboardingFlow( flow ) ||
			isOnboardingPMFlow( flow )
		) {
			providedDependencies.goToCheckout = true;
		}

		submit?.( providedDependencies );
	};

	const isAllowedToGoBack =
		isOnboardingPMFlow( flow ) || isDomainUpsellFlow( flow ) || isNewHostedSiteCreationFlow( flow );

	const importSiteUrl = useSitesDashboardImportSiteUrl();

	return (
		<StepContainer
			stepName="plans"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ false }
			isFullLayout={ true }
			hideFormattedHeader={ true }
			isLargeSkipLayout={ false }
			skipLabelText={ __( 'Import a site' ) }
			goNext={ () => window.location.assign( importSiteUrl ) }
			hideBack={ ! isAllowedToGoBack }
			stepContent={ <PlansWrapper flowName={ flow } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
