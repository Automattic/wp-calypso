import {
	DomainUpdateStatus,
	JobStatus,
	BulkUpdateVariables,
	BulkDomainUpdateStatusQueryFnData,
} from '@automattic/data-stores';
import { DomainData as QueryDomainData } from '@automattic/data-stores/src/queries/use-site-domains-query';
import { DomainStatusPurchaseActions, ResponseDomain } from '@automattic/domains-table';
import { DomainAction } from '@automattic/domains-table/src/domains-table/domains-table-row-actions';
import { SiteExcerptData } from '@automattic/sites';

type DomainActionDescription = {
	message?: string;
	action: () => void | Promise< void >;
};

type OnDomainAction = (
	action: DomainAction,
	domain: ResponseDomain
) => DomainActionDescription | void;

interface DomainsDataViewsUpdatingDomain {
	action: DomainAction;
	domain: string;
	created_at: number;
	message?: string;
}

interface BaseDomainsDataViewsProps {
	className?: string;
	domains: DomainData[];
	isLoading: boolean;
	selectedItem: DomainData | null | undefined;
	openDomainPane?: ( domain: DomainData ) => void;
	isAllSitesView: boolean;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
	onDomainAction?: OnDomainAction;
	userCanSetPrimaryDomains?: boolean;
	hideCheckbox?: boolean;
	isLoadingDomains?: boolean;
	useMobileCards?: boolean;
	sidebarMode?: boolean;
	selectedDomainName?: string;
	selectedFeature?: string;
	createBulkAction?: ( variables: BulkUpdateVariables ) => Promise< void >;
	fetchBulkActionStatus?: () => Promise< BulkDomainUpdateStatusQueryFnData >;
	deleteBulkActionStatus?: () => Promise< void >;
	currentUserCanBulkUpdateContactInfo?: boolean;
}

export type DomainsDataViewsProps =
	| ( BaseDomainsDataViewsProps & { isAllSitesView: true } )
	| ( BaseDomainsDataViewsProps & { isAllSitesView: false; siteSlug: string | null } );

export interface Context {
	sites: Record< number, SiteExcerptData >;
	isLoadingSites?: boolean;
	isLoadingDomains?: boolean;
	createBulkAction?: ( variables: BulkUpdateVariables ) => Promise< void >;
	fetchBulkActionStatus?: () => Promise< BulkDomainUpdateStatusQueryFnData >;
	deleteBulkActionStatus?: () => Promise< void >;
	isAllSitesView: boolean;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
	domainsRequiringAttention?: number;
	handleAutoRenew: ( domains: DomainData[], enable: boolean ) => void;
	handleUpdateContactInfo: ( domains: DomainData[] ) => void;
	onDomainsRequiringAttentionChange: ( domainsRequiringAttention: number ) => void;
	completedJobs: JobStatus[];
	domainResults: Map< string, DomainUpdateStatus[] >;
	handleRestartDomainStatusPolling: () => void;
	onDomainAction( ...parameters: Parameters< OnDomainAction > ): void;
	updatingDomain: DomainsDataViewsUpdatingDomain | null;
	userCanSetPrimaryDomains: BaseDomainsDataViewsProps[ 'userCanSetPrimaryDomains' ];
	isDesktop: boolean;
	selectedFeature?: string;
}

type DomainDataExtension = {
	site_slug: string;
	domain_status: {
		status: string;
		status_type: string;
		status_weight: number;
	};
	can_manage_dns_records: boolean;
};

export type QueryDomainExtendedData = QueryDomainData & DomainDataExtension;

export type DomainData = {
	original: QueryDomainExtendedData;
	processed: ResponseDomain;
};

export interface DomainsQueryArgs {
	no_wpcom?: boolean;
	resolve_status?: boolean;
	extended_data?: boolean;
}

export interface DomainsQueryFnData {
	domains: QueryDomainExtendedData[];
}
