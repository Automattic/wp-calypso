import { SiteData } from 'calypso/state/ui/selectors/site-data';

type Maybe< T > = T | null;

export type DomainManagementHeaderProps = {
	selectedDomainName: string;
	isManagingAllDomains: boolean;
	selectedSite: Maybe< SiteData >;
};
