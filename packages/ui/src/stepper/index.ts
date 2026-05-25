// packages/ui/src/stepper/index.ts
import { StepperDescription } from './description';
import { StepperIndicator } from './indicator';
import { StepperList } from './list';
import { StepperPanel } from './panel';
import { StepperRoot } from './root';
import { StepperStep } from './step';
import { StepperTitle } from './title';
import { StepperTrigger } from './trigger';

export const Stepper = {
	Root: StepperRoot,
	List: StepperList,
	Step: StepperStep,
	Indicator: StepperIndicator,
	Title: StepperTitle,
	Description: StepperDescription,
	Trigger: StepperTrigger,
	Panel: StepperPanel,
};
