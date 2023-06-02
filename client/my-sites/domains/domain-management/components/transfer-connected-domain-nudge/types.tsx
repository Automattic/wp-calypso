import type { ResponseDomain } from 'calypso/lib/domains/types';

export type TransferConnectedDomainNudgeProps = {
	domain: ResponseDomain;
	location: string; // where the nudge is being shown
	siteSlug: string;
};
