import type { Flow, StepperStep } from '../declarative-flow/internals/types';

const USER_STEP: StepperStep = {
	slug: 'user',
	asyncComponent: () =>
		import(
			/* webpackChunkName: "stepper-user-step" */ '../declarative-flow/internals/steps-repository/__user'
		),
};

function useInjectUserStepIfNeeded( flow: Flow ): StepperStep[] {
	const steps = flow.useSteps();
	const firstAuthWalledStep = steps.findIndex( ( step ) => step.requiresLoggedInUser );

	if ( firstAuthWalledStep === -1 ) {
		return steps;
	}

	const newSteps = [ ...steps ];
	newSteps.splice( firstAuthWalledStep, 0, USER_STEP );
	return newSteps;
}

export function enhanceFlowWithAuth( flow: Flow ): Flow {
	return {
		...flow,
		useSteps: () => useInjectUserStepIfNeeded( flow ),
	};
}
