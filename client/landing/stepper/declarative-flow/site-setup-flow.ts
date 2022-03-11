import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const siteSetupFlow: Flow = {
	useSteps() {
		return [ 'intent', 'options', 'build', 'sell', 'import' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const isHidden = currentStep === 'intent' ? true : false;
		const goBack = () => {
			if (
				currentStep === 'options' ||
				currentStep === 'build' ||
				currentStep === 'sell' ||
				currentStep === 'import'
			) {
				navigate( 'intent' );
			}
		};
		const goNext = goBack;
		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};
		return { goNext, goBack, goToStep, isHidden };
	},
};
