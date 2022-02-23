import type { Flow } from './internals/types';

export const exampleFlow: Flow = {
	useSteps() {
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
		return { goNext, goBack };
	},
};
