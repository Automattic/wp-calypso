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
	staticSiteImport: {
		sessionId: string;
		planHash?: string;
		status: string;
		state: string;
		sourceDigest?: string;
		previewSummary?: Record< string, number >;
		approved?: boolean;
	};
	site: CreatedSite;
} >;

export type FlowStateManifest = StepperMiscellaneousFields & StepperStepsUnionedType;
