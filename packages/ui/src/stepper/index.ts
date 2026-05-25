import { StepperDescription } from './description';
import { StepperIndicator } from './indicator';
import { StepperList } from './list';
import { StepperPanel } from './panel';
import { StepperRoot } from './root';
import { StepperStep } from './step';
import { StepperTitle } from './title';
import { StepperTrigger } from './trigger';

export { StepperDescription } from './description';
export { StepperIndicator } from './indicator';
export { StepperList } from './list';
export { StepperPanel } from './panel';
export { StepperRoot } from './root';
export { StepperStep } from './step';
export { StepperTitle } from './title';
export { StepperTrigger } from './trigger';
export type {
	StepperDescriptionProps,
	StepperIndicatorProps,
	StepperListProps,
	StepperPanelProps,
	StepperRef,
	StepperRootProps,
	StepperStepProps,
	StepperTitleProps,
	StepperTriggerProps,
	StepStatus,
} from './types';

/** Namespace object for Tier 2 primitive usage: `<Stepper.Root>`, `<Stepper.Step>`, etc. */
export const Stepper = {
	Root: StepperRoot,
	List: StepperList,
	Step: StepperStep,
	Trigger: StepperTrigger,
	Panel: StepperPanel,
	Indicator: StepperIndicator,
	Title: StepperTitle,
	Description: StepperDescription,
} as const;
