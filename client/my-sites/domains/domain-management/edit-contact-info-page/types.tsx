import { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDetails } from '@automattic/data-stores';
export type EditContactInfoPageProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	isRequestingWhois: boolean;
	selectedDomainName: string;
	selectedSite: SiteDetails | null;
};

export type EditContactInfoPageContentProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	selectedDomainName: string;
	selectedSite: SiteDetails | null;
};
