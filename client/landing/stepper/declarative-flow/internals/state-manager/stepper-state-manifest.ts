import type { StepperStepsUnionedType } from '../types';
import type { createSite } from 'calypso/landing/stepper/hooks/use-create-site-hook';

type CreatedSite = Awaited< ReturnType< typeof createSite > >;

/**
 * The manifest of the state of all available state fields in Stepper. Feel free to type and add all the fields you need.
 */
export type StepperMiscellaneousFields = Partial< {
	flow: {
		entryPoint: string;
	};
	site: CreatedSite;
} >;

export type FlowStateManifest = StepperMiscellaneousFields & StepperStepsUnionedType;
