import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import recordGTMDatalayerEvent from 'calypso/lib/analytics/ad-tracking/woo/record-gtm-datalayer-event';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import AssignTrialPlanStep from './internals/steps-repository/assign-trial-plan';
import { AssignTrialResult } from './internals/steps-repository/assign-trial-plan/constants';
import ErrorStep from './internals/steps-repository/error-step';
import ProcessingStep from './internals/steps-repository/processing-step';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import WaitForAtomic from './internals/steps-repository/wait-for-atomic';
import WaitForPluginInstall from './internals/steps-repository/wait-for-plugin-install';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const wooexpress: Flow = {
	name: 'wooexpress',

	useSteps() {
		return [
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'assignTrialPlan', component: AssignTrialPlanStep },
			{ slug: 'waitForAtomic', component: WaitForAtomic },
			{ slug: 'waitForPluginInstall', component: WaitForPluginInstall },
			{ slug: 'error', component: ErrorStep },
		];
	},
	useAssertConditions(): AssertConditionResult {
		const { setProfilerData } = useDispatch( ONBOARD_STORE );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const flowName = this.name;

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

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

		const getStartUrl = () => {
			let hasFlowParams = false;
			const flowParams = new URLSearchParams();
			const queryParams = new URLSearchParams();

			if ( vendorId ) {
				queryParams.set( 'vid', vendorId );
			}

			if ( aff ) {
				queryParams.set( 'aff', aff );
			}

			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				`/setup/wooexpress` +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );

			let queryString = `redirect_to=${ redirectTarget }`;

			if ( queryParams.toString() ) {
				queryString = `${ queryString }&${ queryParams.toString() }`;
			}

			const logInUrl = getLoginUrl( {
				variationName: flowName,
				locale,
			} );

			return `${ logInUrl }&${ queryString }`;
		};

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/wooexpress/siteCreationStep route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/wooexpress/<locale> starting points and /setup/wooexpress/siteCreationStep/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				const logInUrl = getStartUrl();
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

		const { setStepProgress, setPluginsToVerify } = useDispatch( ONBOARD_STORE );
		setPluginsToVerify( [ 'woocommerce' ] );

		const flowProgress = useSiteSetupFlowProgress( currentStep, intent );
		setStepProgress( flowProgress );

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
				case 'siteCreationStep': {
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
						return exitFlow( `${ adminUrl }admin.php?page=wc-admin` );
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
