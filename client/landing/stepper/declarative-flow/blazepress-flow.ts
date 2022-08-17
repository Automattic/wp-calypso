import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const blazePressFlow: Flow = {
	name: 'blazepress',

	useSteps() {
		return [ 'promote' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		// function submit( providedDependencies: ProvidedDependencies = {} ) {
		function submit() {
			switch ( currentStep ) {
				case 'promote':
					return navigate( 'promote' );
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
