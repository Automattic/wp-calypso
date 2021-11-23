import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type TransferPageProps = {
	selectedDomainName: string;
	selectedSite: SiteData;
	currentRoute: string;
};
