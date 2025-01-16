import { SiteDetails } from '@automattic/data-stores';
import { DomainStepResult, PlansStepResult } from './types';

/**
 * The manifest of the state of all available state fields in Stepper. Feel free to type and add all the fields you need.
 */
export type FlowStateManifest = Partial< {
	domains: DomainStepResult;
	plan: PlansStepResult;
	newsletterSetup: {
		siteTitle: string;
		tagline: string;
	};
	newsletterGoals: {
		goals: string[];
	};
	siteId: SiteDetails[ 'ID' ];
	siteSlug: SiteDetails[ 'slug' ];
	processing: {
		siteId: number;
		siteSlug: string;
		domainItem?: DomainStepResult[ 'domainItem' ];
		goToCheckout?: true;
	};
} >;
