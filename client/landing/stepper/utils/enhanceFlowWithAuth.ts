import { PRIVATE_STEPS } from '../declarative-flow/internals/steps';
import type { Flow, FlowV1, StepperStep } from '../declarative-flow/internals/types';

function useInjectUserStepIfNeededForV1( flow: FlowV1 ): readonly StepperStep[] {
	const steps = flow.useSteps();
	return injectUserStepInSteps( steps );
}

function injectUserStepInSteps( steps: readonly StepperStep[] ) {
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

// This is pretty wonky because it has to support both V1 and V2 flows. Should be fixed soon to drop support for V1 flows.
export function enhanceFlowWithAuth( flow: Flow, steps: readonly StepperStep[] | null ): Flow {
	/**
	 * For V1 flows, we enhance `useSteps` method. For V2 flows, we enhance the return value of `bootFlow` method.
	 */
	if ( 'useSteps' in flow ) {
		return {
			...flow,
			useSteps: () => useInjectUserStepIfNeededForV1( flow ) as StepperStep[],
		};
	} else if ( steps ) {
		return {
			...flow,
			bootFlow: () => injectUserStepInSteps( steps ),
		};
	}
	return flow;
}
