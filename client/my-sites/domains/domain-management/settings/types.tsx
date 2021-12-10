import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type SettingsPagePassedProps = {
	domains: ResponseDomain[] | null;

	currentRoute: string;
	selectedSite: SiteData;
	selectedDomainName: string;
};

export type SettingsPageConnectedProps = {
	domain: ResponseDomain;
	currentRoute: string;
	hasDomainOnlySite: boolean;
};

export type SettingsHeaderProps = {
	domain: ResponseDomain;
};
export type SettingsPageProps = SettingsPagePassedProps & SettingsPageConnectedProps;
