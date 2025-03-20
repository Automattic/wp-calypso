import { stepWithRequiredLogin } from './step-with-required-login';
import type { StepperStep } from 'calypso/landing/stepper/declarative-flow/internals/types';

export function stepsWithRequiredLogin< T extends readonly StepperStep[] >( steps: T ): T {
	return steps.map( stepWithRequiredLogin ) as unknown as T;
}
