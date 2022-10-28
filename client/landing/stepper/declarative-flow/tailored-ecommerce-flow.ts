import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const tailoredEcommerceFlow: Flow = {
	name: 'tailored-ecommerce',

	useSteps() {
		return [ 'storeProfiler' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'tailored-ecommerce', flowName, currentStep );

			switch ( currentStep ) {
				case 'storeProfiler':
					return navigate( 'storeProfiler' );
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'storeProfiler':
					return navigate( 'storeProfiler' );
				default:
					return navigate( 'storeProfiler' );
			}
		};

		const goNext = () => {
			switch ( currentStep ) {
				case 'storeProfiler':
					// @TODO this will need logic updates
					return navigate( 'storeProfiler' );
				default:
					return navigate( 'storeProfiler' );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
