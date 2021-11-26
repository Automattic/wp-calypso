import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type TransferPageProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	isAtomic: boolean;
	isDomainInfoLoading: boolean;
	isDomainLocked: boolean;
	isDomainOnly: boolean;
	isLockingOrUnlockingDomain: boolean;
	isMapping: boolean;
	isPrimaryDomain: boolean;
	isRequestingTransferCode: boolean;
	isCancelingTransfer: boolean;
	lockDomain: any; // TODO: Fix this
	requestDomainTransferCodeOnly: any; // TODO: Fix this
	selectedDomainName: string;
	selectedSite: SiteData;
	unlockDomain: any; // TODO: Fix this
};
