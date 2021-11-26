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
	lockDomain: ( selectedDomainName: string, options: Record< string, unknown > ) => void;
	requestDomainTransferCodeOnly: ( selectedDomainName: string ) => void;
	selectedDomainName: string;
	selectedSite: SiteData;
	unlockDomain: ( selectedDomainName: string, options: Record< string, unknown > ) => void;
};
