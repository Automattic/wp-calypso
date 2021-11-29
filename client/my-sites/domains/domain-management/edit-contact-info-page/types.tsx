import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type EditContactInfoPageProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	isRequestingWhois: boolean;
	selectedDomainName: string;
	selectedSite: SiteData | null;
};
