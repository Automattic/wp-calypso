import type { DomainStepResult, PlansStepResult } from './types';
import type { SiteDetails } from '@automattic/data-stores';
import type { createSite } from 'calypso/landing/stepper/hooks/use-create-site-hook';

type CreatedSite = Awaited< ReturnType< typeof createSite > >;

/**
 * The manifest of the state of all available state fields in Stepper. Feel free to type and add all the fields you need.
 */
export type FlowStateManifest = Partial< {
	domains: DomainStepResult;
	flow: {
		entryPoint: string;
	};
	plans: PlansStepResult;
	newsletterSetup: {
		siteTitle: string;
		tagline: string;
	};
	newsletterGoals: {
		goals: string[];
	};
	site: CreatedSite;
	siteId: SiteDetails[ 'ID' ];
	siteSlug: SiteDetails[ 'slug' ];
	processing: {
		siteId: number;
		siteSlug: string;
		domainItem?: DomainStepResult[ 'domainItem' ];
		goToCheckout?: true;
		goToHome?: true;
	};
} >;
