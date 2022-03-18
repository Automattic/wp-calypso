import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const bloggerFlow: Flow = {
	useSteps() {
		return [ 'options', 'bloggerStartingPoint' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			if ( currentStep === 'options' ) {
				navigate( 'bloggerStartingPoint' );
			} else {
				navigate( 'intent' );
			}
		};
		const goNext = goBack;
		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};
		return { goNext, goBack, goToStep };
	},
};
