import config from '@automattic/calypso-config';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import recordGTMDatalayerEvent from 'calypso/lib/analytics/ad-tracking/woo/record-gtm-datalayer-event';
import { logToLogstash } from 'calypso/lib/logstash';
import { login } from 'calypso/lib/paths';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { AssignTrialResult } from './internals/steps-repository/assign-trial-plan/constants';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const wooexpress: Flow = {
	name: 'wooexpress',
	isSignupFlow: true,

	useSteps() {
		return [
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.ASSIGN_TRIAL_PLAN,
			STEPS.WAIT_FOR_ATOMIC,
			STEPS.WAIT_FOR_PLUGIN_INSTALL,
			STEPS.ERROR,
		];
	},
	useAssertConditions(): AssertConditionResult {
		const { setProfilerData } = useDispatch( ONBOARD_STORE );
		const { setSiteSetupError } = useDispatch( SITE_STORE );
		const translate = useTranslate();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const locale = useFlowLocale();

		setSiteSetupError(
			undefined,
			translate(
				'It looks like something went wrong while setting up your store. Please contact support so that we can help you out.'
			)
		);

		const queryParams = new URLSearchParams( window.location.search );
		const profilerData = queryParams.get( 'profilerdata' );
		const aff = queryParams.get( 'aff' );
		const vendorId = queryParams.get( 'vid' );

		if ( profilerData ) {
			try {
				const decodedProfilerData = JSON.parse(
					decodeURIComponent( escape( window.atob( profilerData ) ) )
				);

				setProfilerData( decodedProfilerData );
				// Ignore any bad/invalid data and prevent it from causing downstream issues.
			} catch {}
		}

		const getLoginUrl = () => {
			const redirectTo = addQueryArgs(
				`${ window.location.protocol }//${ window.location.host }/setup/wooexpress`,
				{
					...Object.fromEntries( queryParams ),
				}
			);

			let logInUrl = login( {
				locale,
				redirectTo,
				oauth2ClientId: queryParams.get( 'client_id' ) || undefined,
				wccomFrom: queryParams.get( 'wccom-from' ) || undefined,
			} );

			if ( aff ) {
				logInUrl = addQueryArgs( logInUrl, { aff } );
			}

			if ( vendorId ) {
				logInUrl = addQueryArgs( logInUrl, {
					vid: vendorId,
				} );
			}
			return logInUrl;
		};

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/wooexpress/create-site route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/wooexpress/<locale> starting points and /setup/wooexpress/create-site/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			// Log when profiler data does not contain valid data.
			let isValidProfile = false;
			try {
				if ( profilerData ) {
					const data = JSON.parse( decodeURIComponent( escape( window.atob( profilerData ) ) ) );
					isValidProfile = [ 'woocommerce_onboarding_profile', 'blogname' ].every(
						( key ) => key in data
					);
				}
			} catch {}
			if ( ! isValidProfile ) {
				logToLogstash( {
					feature: 'calypso_client',
					message: 'calypso_stepper_wooexpress_invalid_profiler_data',
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					properties: {
						env: config( 'env_id' ),
					},
					extra: {
						'profiler-data': profilerData,
					},
				} );
			}

			if ( ! userIsLoggedIn ) {
				const logInUrl = getLoginUrl();
				window.location.assign( logInUrl );
			}
		}, [] );

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'wooexpress-trial requires a logged in user',
			};
		}

		return result;
	},
	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
		const siteSlugParam = useSiteSlugParam();

		const { setPluginsToVerify } = useDispatch( ONBOARD_STORE );
		setPluginsToVerify( [ 'woocommerce' ] );

		const { getSiteIdBySlug, getSiteOption } = useSelect(
			( select ) => select( SITE_STORE ) as SiteSelect,
			[]
		);

		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, intent, flowName, currentStep );
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug );
			const adminUrl = siteId && getSiteOption( siteId, 'admin_url' );

			switch ( currentStep ) {
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
						recordGTMDatalayerEvent( 'free trial processing' );
						// Redirect users to the login page with the 'action=jetpack-sso' parameter to initiate Jetpack SSO login and redirect them to the wc admin page after.
						const redirectTo = encodeURIComponent(
							`${ adminUrl as string }admin.php?page=wc-admin`
						);

						return exitFlow(
							`//${ siteSlug }/wp-login.php?action=jetpack-sso&redirect_to=${ redirectTo }`
						);
					}

					return navigate( 'assignTrialPlan', { siteSlug } );
				}

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
		}

		return { submit, exitFlow };
	},
};

export default wooexpress;
