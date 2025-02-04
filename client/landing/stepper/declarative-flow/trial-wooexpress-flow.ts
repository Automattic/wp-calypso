import config from '@automattic/calypso-config';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import recordGTMDatalayerEvent from 'calypso/lib/analytics/ad-tracking/woo/record-gtm-datalayer-event';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
import { STEPS } from './internals/steps';
import { AssignTrialResult } from './internals/steps-repository/assign-trial-plan/constants';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';
import type { SiteSelect } from '@automattic/data-stores';

const wooexpress: Flow = {
	name: 'wooexpress',
	isSignupFlow: true,

	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.ASSIGN_TRIAL_PLAN,
			STEPS.WAIT_FOR_ATOMIC,
			STEPS.WAIT_FOR_PLUGIN_INSTALL,
			STEPS.ERROR,
		] );
	},

	useLoginParams() {
		const [ searchParams ] = useSearchParams();

		const oauth2ClientId = searchParams.get( 'client_id' );
		const wccomFrom = searchParams.get( 'wccom-from' );
		const aff = searchParams.get( 'aff' );
		const vendorId = searchParams.get( 'vid' );

		return {
			customLoginPath: '/log-in',
			extraQueryParams: {
				...( oauth2ClientId ? { oauth2ClientId } : {} ),
				...( wccomFrom ? { wccomFrom } : {} ),
				...( aff ? { aff } : {} ),
				...( vendorId ? { vendorId } : {} ),
			},
		};
	},

	useAssertConditions(): AssertConditionResult {
		const { setProfilerData } = useDispatch( ONBOARD_STORE );
		const { setSiteSetupError } = useDispatch( SITE_STORE );
		const translate = useTranslate();

		setSiteSetupError(
			undefined,
			translate(
				'It looks like something went wrong while setting up your store. Please contact support so that we can help you out.'
			)
		);

		const queryParams = new URLSearchParams( window.location.search );
		const profilerData = queryParams.get( 'profilerdata' );

		if ( profilerData ) {
			try {
				const decodedProfilerData = JSON.parse(
					decodeURIComponent( escape( window.atob( profilerData ) ) )
				);

				setProfilerData( decodedProfilerData );
				// Ignore any bad/invalid data and prevent it from causing downstream issues.
			} catch {}
		}

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
		}, [] );

		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation( currentStep, navigate ) {
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
