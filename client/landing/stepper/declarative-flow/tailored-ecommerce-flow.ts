import { useDispatch } from '@wordpress/data';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const tailoredEcommerceFlow: Flow = {
	name: 'tailored-ecommerce',

	useSteps() {
		return [ 'storeProfiler', 'designCarousel' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;

		// Leaving this as a placeholder for the actual logic
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		setStepProgress( { progress: 1, count: 4 } );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'tailored-ecommerce', flowName, currentStep );

			switch ( currentStep ) {
				case 'storeProfiler':
					return navigate( 'storeProfiler' );
				case 'designCarousel':
					return navigate( 'designCarousel' );
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'storeProfiler':
					return navigate( 'storeProfiler' );
				case 'designCarousel':
					return navigate( 'designCarousel' );
				default:
					return navigate( 'storeProfiler' );
			}
		};

		const goNext = () => {
			switch ( currentStep ) {
				case 'storeProfiler':
					// @TODO this will need logic updates
					return navigate( 'storeProfiler' );
				case 'designCarousel':
					return navigate( 'designCarousel' );
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
