import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type TransferPageProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	isAtomic: boolean;
	isDomainOnly: boolean;
	isPrimaryDomain: boolean;
	selectedDomainName: string;
	selectedSite: SiteData;
};
