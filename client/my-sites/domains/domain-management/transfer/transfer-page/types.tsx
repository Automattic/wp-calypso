import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type TransferPageProps = {
	currentRoute: string;
	domain: any; // TODO: Fix this
	domains: ResponseDomain[];
	isAtomic: boolean;
	isDomainOnly: boolean;
	isMapping: boolean;
	isPrimaryDomain: boolean;
	isRequestingTransferCode: boolean;
	isCancelingTransfer: boolean;
	unlockDomain: any; // TODO: Fix this
	requestDomainTransferCodeOnly: any; // TODO: Fix this
	selectedDomainName: string;
	selectedSite: SiteData;
};
