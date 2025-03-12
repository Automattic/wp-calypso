import wpcom from 'calypso/lib/wp';
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
		return stepsWithRequiredLogin( [
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.LAUNCH_BIG_SKY,
		] );
	},
	useStepNavigation( currentStep, navigate ) {
		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				// The create-site step will start creating a site and will add the promise of that operation to pendingAction field in the store.
				case 'create-site': {
					// Go to the processing step and pass `true` to remove it from history. So clicking back will not go back to the create-site step.
					return navigate( 'processing', undefined, true );
				}
				// The processing step will wait the aforementioned promise to be resolved and then will submit to you whatever the promise resolves to.
				// Which will be the created site { "siteId": "242341575", "siteSlug": "something.wordpress.com", "goToCheckout": false, "siteCreated": true }
				case 'processing': {
					const { siteSlug, siteId } = providedDependencies;

					try {
						await wpcom.req.post( {
							apiNamespace: 'wpcom/v2',
							path: `/sites/${ siteId }/send-email-continue-site-build`,
							body: {
								continue_url: `https://${ siteSlug }/wp-admin/site-editor.php?canvas=edit`,
							},
						} );
					} catch ( error ) {
						// eslint-disable-next-line no-console
						console.error( 'Failed to send continue build email:', error );
					}
					return navigate(
						`launch-big-sky?siteId=${ siteId }&siteSlug=${ siteSlug }&referrer=ai-site-builder`,
						undefined,
						true
					);
				}
				default:
					return;
			}
		}

		return { submit };
	},
};

export default aiSiteBuilder;
