import type { DomainStepResult, PlansStepResult } from './types';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * The manifest of the state of all available state fields in Stepper. Feel free to type and add all the fields you need.
 */
export type FlowStateManifest = Partial< {
	domains: DomainStepResult;
	plans: PlansStepResult;
	newsletterSetup: {
		siteTitle: string;
		tagline: string;
	};
	newsletterGoals: {
		goals: string[];
	};
	site: SiteDetails;
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
