import { stepWithRequiredLogin } from './step-with-required-login';
import type { StepperStep } from 'calypso/landing/stepper/declarative-flow/internals/types';

export function stepsWithRequiredLogin< T extends StepperStep[] >( steps: T ): T {
	// Trick TS to believe the same array is returned without any changes.
	// This is needed to convince TS that steps and their order haven't actually changed.
	return steps.map( stepWithRequiredLogin ) as unknown as T;
}
