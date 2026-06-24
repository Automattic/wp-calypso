// packages/ui/src/horizontal-stepper/horizontal-stepper-step.tsx
import type { StepProps } from '../stepper/types';

export type HorizontalStepperStepProps = Omit< StepProps, 'description' >;

/**
 * Step descriptor for HorizontalStepper.
 * Renders nothing — HorizontalStepper reads props from this element directly
 * at render time to build the tab list and panels.
 */
export const HorizontalStepperStep: ( props: HorizontalStepperStepProps ) => null = () => null;
