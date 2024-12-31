import { PRIVATE_STEPS } from '../declarative-flow/internals/steps';
import type { Flow, StepperStep } from '../declarative-flow/internals/types';

function useInjectUserStepIfNeeded( flow: Flow ): StepperStep[] {
	const steps = flow.useSteps();
	const firstAuthWalledStep = steps.findIndex( ( step ) => step.requiresLoggedInUser );

	if ( firstAuthWalledStep === -1 ) {
		return steps;
	}

	// For logged-out users, we will redirect steps that require auth to the user step,
	// and then redirect back to the original steps after auth.
	// Therefore, we must avoid placing the user step as the first step,
	// as it would prevent us from knowing which step to redirect back to.
	return [ ...steps, PRIVATE_STEPS.USER ];
}

export function enhanceFlowWithAuth( flow: Flow ): Flow {
	return {
		...flow,
		useSteps: () => useInjectUserStepIfNeeded( flow ),
	};
}
