import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import { ENTREPRENEUR_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { anonIdCache } from 'calypso/data/segmentaton-survey';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useFlowLocale } from '../hooks/use-flow-locale';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const SEGMENTATION_SURVEY_SLUG = 'start';

const entrepreneurFlow: Flow = {
	name: ENTREPRENEUR_FLOW,

	isSignupFlow: true,

	useSteps() {
		return [
			// Replacing the `segmentation-survey` slug with `start` as having the
			// word `survey` in the address bar might discourage users from continuing.
			{ ...STEPS.SEGMENTATION_SURVEY, ...{ slug: SEGMENTATION_SURVEY_SLUG } },
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.WAIT_FOR_ATOMIC,
			STEPS.WAIT_FOR_PLUGIN_INSTALL,
			STEPS.ERROR,
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;

		const { setPluginsToVerify } = useDispatch( ONBOARD_STORE );
		setPluginsToVerify( [ 'woocommerce' ] );

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

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, '' /* intent */, flowName, currentStep );

			switch ( currentStep ) {
				case SEGMENTATION_SURVEY_SLUG: {
					if ( userIsLoggedIn ) {
						return navigate( STEPS.SITE_CREATION_STEP.slug );
					}

					// Redirect user to the sign-in/sign-up page before site creation.
					const entrepreneurLoginUrl = getEntrepreneurLoginUrl();
					return window.location.replace( entrepreneurLoginUrl );
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					return navigate( STEPS.PROCESSING.slug, {
						currentStep,
					} );
				}

				case STEPS.PROCESSING.slug: {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( STEPS.ERROR.slug );
					}

					const { siteId, siteSlug } = providedDependencies;

					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return navigate( STEPS.WAIT_FOR_PLUGIN_INSTALL.slug, { siteId, siteSlug } );
					}

					if ( providedDependencies?.pluginsInstalled ) {
						const stagingUrl = ( siteSlug as string ).replace(
							'.wordpress.com',
							'.wpcomstaging.com'
						);

						const redirectTo = encodeURIComponent(
							`https://${ stagingUrl }/wp-admin/admin.php?page=wc-admin&path=%2Fcustomize-store%2Fdesign-with-ai&ref=entrepreneur-signup`
						);

						// Redirect users to the login page with the 'action=jetpack-sso' parameter to initiate Jetpack SSO login and redirect them to Woo CYS's Design With AI after. This URL, however, is just symbolic because somewhere within Jetpack SSO or some plugin is stripping off the `redirect_to` param. The actual work that is doing the redirection is in wpcomsh/1801.
						let redirectToWithSSO = `https://${ stagingUrl }/wp-login.php?action=jetpack-sso&redirect_to=${ redirectTo }`;

						// Temporarily redirect to Calypso My Home until Woo Express 8.9 is deployed.
						redirectToWithSSO = `/home/${ stagingUrl }?ref=entrepreneur-signup&flags=entrepreneur-my-home`;

						return window.location.assign( redirectToWithSSO );
					}

					return navigate( STEPS.WAIT_FOR_ATOMIC.slug, { siteId, siteSlug } );
				}

				case STEPS.WAIT_FOR_ATOMIC.slug: {
					return navigate( STEPS.PROCESSING.slug, {
						currentStep,
					} );
				}

				case STEPS.WAIT_FOR_PLUGIN_INSTALL.slug: {
					return navigate( STEPS.PROCESSING.slug );
				}
			}
			return providedDependencies;
		}

		return { submit };
	},

	useSideEffect() {
		const isLoggedIn = useSelector( isUserLoggedIn );

		useEffect( () => {
			// We need to store the anonymous user ID in localStorage because
			// we need to pass it to the server on site creation, i.e. after the user signs up or logs in.
			const anonymousUserId = getTracksAnonymousUserId();
			if ( anonymousUserId ) {
				anonIdCache.store( anonymousUserId );
			}
		}, [ isLoggedIn ] );
	},
};

export default entrepreneurFlow;
