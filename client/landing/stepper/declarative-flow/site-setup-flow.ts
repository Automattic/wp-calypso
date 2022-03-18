import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const siteSetupFlow: Flow = {
	useSteps() {
		return [ 'intent', 'options', 'build', 'sell', 'import', 'wpadmin', 'bloggerStartingPoint' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			switch ( currentStep ) {
				case 'intent':
					return navigate( 'domain' );
				case 'options':
					return navigate( 'intent' );
				case 'bloggerStartingPoint':
					return navigate( 'options' );
				default:
					return navigate( 'intent' );
			}
		};
		const goNext = () => {
			switch ( currentStep ) {
				case 'options':
					return navigate( 'bloggerStartingPoint' );
				case 'bloggerStartingPoint':
					return navigate( 'intent' );
				default:
					return navigate( 'intent' );
			}
		};
		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};
		return { goNext, goBack, goToStep };
	},
};
