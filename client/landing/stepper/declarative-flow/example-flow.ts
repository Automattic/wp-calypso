import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const exampleFlow: Flow = {
	useSteps(): Array< StepPath > {
		return [ 'domain', 'design' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			if ( currentStep === 'domain' ) {
				navigate( 'design' );
			} else {
				navigate( 'domain' );
			}
		};
		const goNext = goBack;
		const goToStep = ( slug: StepPath ) => {
			navigate( slug );
		};
		return { goNext, goBack, goToStep };
	},
};
