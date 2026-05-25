// packages/ui/src/stepper/index.ts
import { StepperDescription } from './description';
import { StepperIndicator } from './indicator';
import { StepperRoot } from './root';
import { StepperStep } from './step';
import { StepperTitle } from './title';

export const Stepper = {
	Root: StepperRoot,
	Step: StepperStep,
	Indicator: StepperIndicator,
	Title: StepperTitle,
	Description: StepperDescription,
};
