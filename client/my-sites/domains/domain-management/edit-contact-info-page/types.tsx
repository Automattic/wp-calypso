import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type EditContactInfoPageProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	selectedDomainName: string;
	selectedSite: SiteData | null;
};
