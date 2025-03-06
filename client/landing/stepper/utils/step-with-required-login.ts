import type { StepperStep } from 'calypso/landing/stepper/declarative-flow/internals/types';

export const stepWithRequiredLogin = < T extends StepperStep >( step: T ): T => ( {
	...step,
	requiresLoggedInUser: true,
} );
