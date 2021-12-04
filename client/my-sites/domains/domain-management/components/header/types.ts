import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

type Maybe< T > = T | null;

export type DomainManagementHeaderPassedProps = {
	domain: ResponseDomain;
};

export type DomainManagementHeaderProps = DomainManagementHeaderPassedProps & {
	selectedDomainName: string;
	isManagingAllDomains: boolean;
	selectedSite: Maybe< SiteData >;
	isMapping: boolean;
};
