import { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { NoticeActionCreator } from 'calypso/state/notices/types';
import type { ReactNode } from 'react';

export type TransferPageProps = {
	domains: ResponseDomain[];
	currentRoute: string;
	errorNotice: ( notice: ReactNode, options: Record< string, unknown > ) => NoticeActionCreator;
	isAtomic: boolean;
	isDomainInfoLoading: boolean;
	isDomainLocked: boolean;
	isDomainOnly: boolean;
	isMapping: boolean;
	isPrimaryDomain: boolean;
	isSupportSession: boolean;
	selectedDomainName: string;
	selectedSite: SiteData;
	successNotice: ( notice: string, options: Record< string, unknown > ) => NoticeActionCreator;
	updateDomainLock: ( selectedDomainName: string, lock: boolean ) => void;
};
