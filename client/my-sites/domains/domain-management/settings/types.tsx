import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type SettingsPageProps = {
	domains: ResponseDomain[] | null;

	currentRoute: string;
	selectedDomainName: string;
	selectedSite: SiteData;
	hasDomainOnlySite: boolean;
};

export type SettingsHeaderProps = {
	domain: ResponseDomain;
};
