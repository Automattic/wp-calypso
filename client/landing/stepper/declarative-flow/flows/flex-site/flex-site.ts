import { FLEX_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';

async function initialize() {
	// Add the flex site creation form step, create-site step, and processing step
	return stepsWithRequiredLogin( [
		STEPS.FLEX_SITE_CREATION,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
	] );
}

const flexSite: FlowV2< typeof initialize > = {
	name: FLEX_SITE_FLOW,
	get title() {
		return translate( 'Create a Flex site' );
	},
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepNavigation( _currentStep, navigate ) {
		const { setSiteTitle } = useDispatch( ONBOARD_STORE );

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case 'flex-site-creation':
					// Store site title in ONBOARD_STORE so create-site step can use it
					if ( providedDependencies?.siteName ) {
						setSiteTitle( providedDependencies.siteName );
					}
					// After user fills out the form, navigate to create-site step
					// The create-site step will use the data stored in the onboard store
					return navigate( STEPS.SITE_CREATION_STEP.slug );

				case 'create-site':
					// Navigate to processing step which will execute the site creation
					// Pass true to remove create-site from history so back button works properly
					return navigate( STEPS.PROCESSING.slug, undefined, true );

				case 'processing': {
					if (
						providedDependencies?.processingResult === ProcessingResult.SUCCESS &&
						typeof providedDependencies.siteSlug === 'string'
					) {
						// Redirect to the Flex site's wp-admin with logmein parameter for direct login
						return window.location.replace(
							`https://${ providedDependencies.siteSlug }/wp-admin/?logmein=direct`
						);
					}
					// Fallback to sites dashboard
					return window.location.replace( '/sites' );
				}
			}
		};

		return { submit };
	},
};

export default flexSite;
