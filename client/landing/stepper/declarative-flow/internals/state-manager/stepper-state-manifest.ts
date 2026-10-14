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
	/**
	 * The site the create-site step made, so reaching that step again adopts it rather than asking
	 * /sites/new for a second one.
	 *
	 * Separate from `site`, which flows using `useCreateSite` write and `useSite` reads. This is
	 * carried by the name the site was asked for, because a flow without
	 * `__experimentalUseSessions` keys its state on the flow alone — nothing scopes the record to
	 * one run, so a later run has to be able to tell that the site on file is not the one it is
	 * asking for.
	 */
	createdSite: {
		siteId: number;
		siteSlug: string;
		requestedName: string;
	};
} >;

export type FlowStateManifest = StepperMiscellaneousFields & StepperStepsUnionedType;
