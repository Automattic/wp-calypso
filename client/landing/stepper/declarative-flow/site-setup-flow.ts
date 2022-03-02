import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const siteSetupFlow: Flow = {
	useSteps() {
		return [ 'intent', 'write', 'build', 'sell', 'import' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			if (
				currentStep === 'write' ||
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
		return { goNext, goBack, goToStep };
	},
};
