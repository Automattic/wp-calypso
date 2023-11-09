import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';
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
	isLoadingPurchase: boolean;
	isMapping: boolean;
	isPrimaryDomain: boolean;
	isSupportSession: boolean;
	purchase: Purchase | null;
	selectedDomainName: string;
	selectedSite: SiteDetails;
	successNotice: ( notice: string, options: Record< string, unknown > ) => NoticeActionCreator;
	updateDomainLock: ( selectedDomainName: string, lock: boolean ) => void;
};
