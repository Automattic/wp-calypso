import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import ProcessingStep, { ProcessingResult } from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';

const wooExpressTrialFlow: Flow = {
	name: 'wooexpress-trial',

	useSteps() {
		return [
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
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
				`/setup/wooExpressTrial` +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );
			const url =
				locale && locale !== 'en'
					? `/start/account/user/${ locale }?variationName=${ flowName }&redirect_to=${ redirectTarget }`
					: `/start/account/user?variationName=${ flowName }&redirect_to=${ redirectTarget }`;

			return url;
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
		const storeType = useSelect( ( select ) => select( ONBOARD_STORE ).getStoreType() );

		const flowProgress = useSiteSetupFlowProgress( currentStep, intent, storeType );

		if ( flowProgress ) {
			setStepProgress( flowProgress );
		}

		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, intent, flowName, currentStep );
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';

			switch ( currentStep ) {
				case 'siteCreationStep': {
					return navigate( 'processing' );
				}

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					return exitFlow( `/home/${ siteSlug }` );
				}
			}
		}

		return { submit, exitFlow };
	},
};

export default wooExpressTrialFlow;
