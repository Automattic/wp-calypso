import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { NoticeActionCreator } from 'calypso/state/notices/types';

export type TransferPageProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	errorNotice: ( notice: string, options: Record< string, unknown > ) => NoticeActionCreator;
	isAtomic: boolean;
	isDomainInfoLoading: boolean;
	isDomainLocked: boolean;
	isDomainOnly: boolean;
	isMapping: boolean;
	isPrimaryDomain: boolean;
	selectedDomainName: string;
	selectedSite: SiteData;
	successNotice: ( notice: string, options: Record< string, unknown > ) => NoticeActionCreator;
	updateDomainLock: ( selectedDomainName: string, lock: boolean ) => void;
};
