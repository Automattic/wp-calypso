import type { StepStatus } from '../stepper/types';
import type { ReactNode } from 'react';

/**
 * Metadata carrier for a VerticalStepper step.
 *
 * This component does not render anything itself. VerticalStepper reads its
 * props to build the trigger + panel for each step.
 */
export interface VerticalStepperStepProps {
	value: string;
	title: string;
	description?: string;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	indicator?: ReactNode;
	/** Keep panel mounted even when inactive. */
	forceMount?: boolean;
	/** Panel content. */
	children: ReactNode;
	className?: string;
}

/**
 * Placeholder component used only to carry props. VerticalStepper reads
 * children of type VerticalStepperStep and renders them into the correct
 * accordion DOM structure.
 */
export const VerticalStepperStep: React.FC< VerticalStepperStepProps > = () => null;

VerticalStepperStep.displayName = 'VerticalStepper.Step';
