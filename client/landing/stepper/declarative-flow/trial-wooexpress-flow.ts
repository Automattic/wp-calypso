import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import AssignTrialPlanStep, {
	AssignTrialResult,
} from './internals/steps-repository/assign-trial-plan';
import ErrorStep from './internals/steps-repository/error-step';
import ProcessingStep, { ProcessingResult } from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import WaitForAtomic from './internals/steps-repository/wait-for-atomic';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';

const wooexpress: Flow = {
	name: 'wooexpress',

	useSteps() {
		return [
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'assignTrialPlan', component: AssignTrialPlanStep },
			{ slug: 'waitForAtomic', component: WaitForAtomic },
			{ slug: 'error', component: ErrorStep },
		];
	},
	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const flowName = this.name;
		const locale = useLocale();

		const getStartUrl = () => {
			let hasFlowParams = false;
			const flowParams = new URLSearchParams();

			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				`/setup/wooexpress` +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );
			// Early return approach
			if ( locale || locale === 'en' ) {
				return `/start/account/user/${ locale }?variationName=${ flowName }&redirect_to=${ redirectTarget }`;
			}

			return `/start/account/user?variationName=${ flowName }&redirect_to=${ redirectTarget }`;

			// Initial URL approach
			const baseUrl = '/start/account/user' + ( locale && locale !== 'en' ? `/${ locale }` : '' );

			return baseUrl + `?variationName=${ flowName }&redirect_to=${ redirectTarget }`;
		};

		if ( ! userIsLoggedIn ) {
			const logInUrl = getStartUrl();
			window.location.assign( logInUrl );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'wooexpress-trial requires a logged in user',
			};
		}

		return result;
	},
	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const siteSlugParam = useSiteSlugParam();

		const { setStepProgress } = useDispatch( ONBOARD_STORE );

		const flowProgress = useSiteSetupFlowProgress( currentStep, intent );
		setStepProgress( flowProgress );

		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) );

		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, intent, flowName, currentStep );
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug );

			switch ( currentStep ) {
				case 'siteCreationStep': {
					return navigate( 'processing' );
				}

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return exitFlow( `/home/${ siteSlug }` );
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
					return navigate( 'processing' );
				}
			}
		}

		return { submit, exitFlow };
	},
};

export default wooexpress;
