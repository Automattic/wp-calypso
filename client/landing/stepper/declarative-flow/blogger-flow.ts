import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const bloggerFlow: Flow = {
	useSteps() {
		return [ 'options', 'domain' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			if ( currentStep === 'options' ) {
				navigate( 'intent' );
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
