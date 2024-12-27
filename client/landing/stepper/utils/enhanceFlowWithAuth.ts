import { STEPS } from '../declarative-flow/internals/steps';
import type { Flow, StepperStep } from '../declarative-flow/internals/types';

function useInjectUserStepIfNeeded( flow: Flow ): StepperStep[] {
	const steps = flow.useSteps();
	const firstAuthWalledStep = steps.findIndex( ( step ) => step.requiresLoggedInUser );

	if ( firstAuthWalledStep === -1 ) {
		return steps;
	}

	const newSteps = [ ...steps ];
	newSteps.splice( firstAuthWalledStep, 0, STEPS.USER );
	return newSteps;
}

export function enhanceFlowWithAuth( flow: Flow ): Flow {
	return {
		...flow,
		useSteps: () => useInjectUserStepIfNeeded( flow ),
	};
}
