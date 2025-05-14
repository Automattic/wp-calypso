import type { StepperStep } from 'calypso/landing/stepper/declarative-flow/internals/types';

export const stepWithRequiredLogin = ( step: StepperStep ): StepperStep => ( {
	...step,
	requiresLoggedInUser: true as const,
} );
