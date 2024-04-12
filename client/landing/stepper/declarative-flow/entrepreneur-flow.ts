import { ENTREPRENEUR_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useFlowLocale } from '../hooks/use-flow-locale';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { AssignTrialResult } from './internals/steps-repository/assign-trial-plan/constants';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { SiteSelect, UserSelect } from '@automattic/data-stores';

const entrepreneurFlow: Flow = {
	name: ENTREPRENEUR_FLOW,

	isSignupFlow: true,

	useSteps() {
		return [
			// Replacing the `segmentation-survey` slug with `start` as having the
			// word `survey` in the address bar might discourage users from continuing.
			{ ...STEPS.SEGMENTATION_SURVEY, ...{ slug: 'start' } },
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.ASSIGN_TRIAL_PLAN, // TODO: See if this can be combined with addHostingTrial
			STEPS.WAIT_FOR_ATOMIC,
			STEPS.WAIT_FOR_PLUGIN_INSTALL,
			STEPS.ERROR,
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;

		const siteSlugParam = useSiteSlugParam();

		const { setPluginsToVerify } = useDispatch( ONBOARD_STORE );
		setPluginsToVerify( [ 'woocommerce' ] );

		const { getSiteIdBySlug, getSiteOption } = useSelect(
			( select ) => select( SITE_STORE ) as SiteSelect,
			[]
		);

		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const locale = useFlowLocale();

		const getEntrepreneurLoginUrl = () => {
			let hasFlowParams = false;
			const flowParams = new URLSearchParams();

			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				`/setup/entrepreneur/create-site` +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );

			const loginUrl = getLoginUrl( {
				variationName: flowName,
				redirectTo: redirectTarget,
				locale,
			} );

			const flags = new URLSearchParams( window.location.search ).get( 'flags' );
			return loginUrl + ( flags ? `&flags=${ flags }` : '' );
		};

		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, '' /* intent */, flowName, currentStep );

			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug );
			const adminUrl = siteId && getSiteOption( siteId, 'admin_url' );

			switch ( currentStep ) {
				case 'start': {
					if ( userIsLoggedIn ) {
						return navigate( 'create-site' );
					}

					// Redirect user to the sign-in/sign-up page before site creation.
					const entrepreneurLoginUrl = getEntrepreneurLoginUrl();
					return window.location.replace( entrepreneurLoginUrl );
				}

				case 'create-site': {
					return navigate( 'processing', {
						currentStep,
					} );
				}

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return navigate( 'waitForPluginInstall', { siteId, siteSlug } );
					}

					if ( providedDependencies?.pluginsInstalled ) {
						// Redirect users to the login page with the 'action=jetpack-sso' parameter to initiate Jetpack SSO login and redirect them to Woo CYS's Design With AI after.

						// TODO: This is currently not working. Need to investigate in further PR.
						const redirectTo = encodeURIComponent(
							`${
								adminUrl as string
							}admin.php?page=wc-admin&path=%2Fcustomize-store%2Fdesign-with-ai&ref=wpcom-entrepreneur-signup`
						);

						return exitFlow(
							`//${ siteSlug }/wp-login.php?action=jetpack-sso&redirect_to=${ redirectTo }`
						);
					}

					return navigate( 'assignTrialPlan', { siteSlug } );
				}

				// TODO: See if this can be combined with addHostingTrial
				case 'assignTrialPlan': {
					const assignTrialResult = params[ 0 ] as AssignTrialResult;

					if ( assignTrialResult === AssignTrialResult.FAILURE ) {
						return navigate( 'error' );
					}

					return navigate( 'waitForAtomic', { siteId, siteSlug } );
				}

				case 'waitForAtomic': {
					return navigate( 'processing', {
						currentStep,
					} );
				}

				case 'waitForPluginInstall': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		}

		return { submit };
	},
};

export default entrepreneurFlow;
