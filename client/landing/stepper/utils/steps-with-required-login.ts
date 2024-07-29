import { stepWithRequiredLogin } from './step-with-required-login';
import type { StepperStep } from 'calypso/landing/stepper/declarative-flow/internals/types';

export const stepsWithRequiredLogin = ( steps: StepperStep[] ): StepperStep[] =>
	steps.map( stepWithRequiredLogin );
