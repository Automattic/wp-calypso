import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const updateOptions: Flow = {
	name: 'update-options',
	trackingConfig: {
		isSignupStartTracked: false,
		isSignupCompleteTracked: false,
	},
	useSteps() {
		return [ STEPS.OPTIONS, STEPS.PROCESSING, STEPS.ERROR ];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();
		const flowToReturnTo = useQuery().get( 'flowToReturnTo' ) || 'free';

		function submit( providedDependencies: ProvidedDependencies = {}, ...results: string[] ) {
			recordSubmitStep( providedDependencies, 'update-options', flowName, currentStep );
			switch ( currentStep ) {
				case 'processing':
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					return window.location.assign(
						`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ siteSlug }`
					);
				case 'options': {
					return navigate( `processing?siteSlug=${ siteSlug }&flowToReturnTo=${ flowToReturnTo }` );
				}
			}
		}

		const goBack = async () => {
			switch ( currentStep ) {
				case 'options':
					return window.location.assign(
						`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ siteSlug }`
					);
			}
		};

		return { goBack, submit };
	},
};

export default updateOptions;
