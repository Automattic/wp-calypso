import type { StepStatus } from '../stepper/types';
import type { ReactNode } from 'react';

/**
 * Metadata carrier for a HorizontalStepper step.
 *
 * This component does not render anything itself. HorizontalStepper reads its
 * props to build the tab list and panels.
 */
export interface HorizontalStepperStepProps {
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
 * Placeholder component used only to carry props. HorizontalStepper reads
 * children of type HorizontalStepperStep and renders them into the correct
 * tabs DOM structure.
 */
export const HorizontalStepperStep: React.FC< HorizontalStepperStepProps > = () => null;

HorizontalStepperStep.displayName = 'HorizontalStepper.Step';
