import { FLEX_SITE_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
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
		return translate( 'Create a Flex Site' );
	},
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepNavigation( _currentStep, navigate ) {
		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case 'flex-site-creation':
					// After user fills out the form, navigate to create-site step
					// The create-site step will use the data stored in the onboard store
					return navigate( STEPS.SITE_CREATION_STEP.slug );

				case 'create-site':
					// Navigate to processing step which will execute the site creation
					// Pass true to remove create-site from history so back button works properly
					return navigate( STEPS.PROCESSING.slug, undefined, true );

				case 'processing':
					if ( providedDependencies?.siteSlug ) {
						return ( window.location.href = `/sites/${ providedDependencies.siteSlug }` );
					}
					// Fallback to sites dashboard
					return ( window.location.href = '/sites' );
			}
		};

		return { submit };
	},
};

export default flexSite;
