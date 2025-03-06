import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { Flow, ProvidedDependencies } from './internals/types';

export const AI_SITE_BUILDER_FLOW = 'ai-site-builder';

const aiSiteBuilder: Flow = {
	name: AI_SITE_BUILDER_FLOW,
	/**
	 * Should it fire calypso_signup_start event?
	 */
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize() {
		// stepsWithRequiredLogin will take care of redirecting to the login step if the user is not logged in.
		return stepsWithRequiredLogin( [ STEPS.SITE_CREATION_STEP, STEPS.PROCESSING ] );
	},
	useStepNavigation( currentStep, navigate ) {
		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				// The create-site step will start creating a site and will add the promise of that operation to pendingAction field in the store.
				case 'create-site': {
					// Go to the processing step and pass `true` to remove it from history. So clicking back will not go back to the create-site step.
					return navigate( 'processing', undefined, true );
				}
				// The processing step will wait the aforementioned promise to be resolved and then will submit to you whatever the promise resolves to.
				// Which will be the created site { "siteId": "242341575", "siteSlug": "something.wordpress.com", "goToCheckout": false, "siteCreated": true }
				case 'processing': {
					const { siteSlug } = providedDependencies;
					// You can redirect anywhere you want.
					// Make sure to redirect using window.location.replace, so the user cannot go back to the processing step.
					window.location.replace( `/home/${ siteSlug }` );
				}
				default:
					return;
			}
		}

		return { submit };
	},
};

export default aiSiteBuilder;
