import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const builderFlow: Flow = {
	useSteps() {
		return [ 'designSetupSite', 'domain' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			if ( currentStep === 'designSetupSite' ) {
				navigate( 'domain' );
			} else {
				navigate( 'designSetupSite' );
			}
		};
		const goNext = goBack;
		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};
		return { goNext, goBack, goToStep };
	},
};
