import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type TransferPageProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	errorNotice: any;
	isAtomic: boolean;
	isDomainInfoLoading: boolean;
	isDomainLocked: boolean;
	isDomainOnly: boolean;
	isMapping: boolean;
	isPrimaryDomain: boolean;
	selectedDomainName: string;
	selectedSite: SiteData;
	successNotice: any;
	updateDomainLock: ( selectedDomainName: string, lock: boolean ) => void;
};
