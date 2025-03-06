import type { StepperStep } from 'calypso/landing/stepper/declarative-flow/internals/types';

export const stepsWithRequiredLogin = < T extends StepperStep[] >( steps: T ): T => {
	steps.forEach( ( step ) => {
		step.requiresLoggedInUser = true;
	} );
	return steps;
};
