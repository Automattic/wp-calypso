import { useSelect, useDispatch } from '@wordpress/data';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import ProcessingStep, { ProcessingResult } from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import { Flow, ProvidedDependencies } from './internals/types';

const ecommerceTrialFlow: Flow = {
	name: 'ecommerce-trial',

	useSteps() {
		return [
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
		];
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

export default ecommerceTrialFlow;
