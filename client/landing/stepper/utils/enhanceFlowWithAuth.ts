import { PRIVATE_STEPS } from '../declarative-flow/internals/steps';
import type { FlowV1, StepperStep } from '../declarative-flow/internals/types';

function useInjectUserStepIfNeededForV1( flow: FlowV1 ): readonly StepperStep[] {
	const steps = flow.useSteps();
	return injectUserStepInSteps( steps );
}

export function injectUserStepInSteps( steps: readonly StepperStep[] ) {
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

/**
 * @deprecated should be removed once #97999 is merged and all flows are migrated to V2.
 */
export function enhanceFlowWithAuth( flow: FlowV1 ): FlowV1 {
	return {
		...flow,
		useSteps: () => useInjectUserStepIfNeededForV1( flow ) as StepperStep[],
	};
}
