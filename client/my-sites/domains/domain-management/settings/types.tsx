import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type SettingsPageProps = {
	currentRoute: string;
	selectedDomainName: string;
	selectedSite: SiteData | null;
	hasDomainOnlySite: boolean | null;
};
