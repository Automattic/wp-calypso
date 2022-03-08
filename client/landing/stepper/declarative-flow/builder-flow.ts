import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const builderFlow: Flow = {
	useSteps() {
		return [ 'designSetupSite' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			navigate( 'designSetupSite' );
		};
		const goNext = goBack;
		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};
		return { goNext, goBack, goToStep };
	},
};
