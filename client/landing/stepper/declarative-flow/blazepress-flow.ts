import { isEnabled } from '@automattic/calypso-config';
import { AssertConditionResult, AssertConditionState, Flow } from './internals/types';
import type { StepPath } from './internals/steps-repository';

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

	useAssertConditions(): AssertConditionResult {
		let result: AssertConditionResult = {
			state: AssertConditionState.SUCCESS,
		};

		if ( ! isEnabled( 'promote-post' ) ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'this is not enabled yet',
			};
		}
		return result;
	},
};
