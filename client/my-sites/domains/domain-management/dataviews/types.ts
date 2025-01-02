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

/**
 * Utility type for domain action descriptions.
 */
type DomainActionDescription = {
	message?: string;
	action: () => void | Promise< void >;
};

/**
 * Utility type for domain action handlers.
 */
type OnDomainAction = (
	action: DomainAction,
	domain: ResponseDomain
) => DomainActionDescription | void;

/**
 * Utility type for updating domain state.
 */
interface DomainsDataViewsUpdatingDomain {
	action: DomainAction;
	domain: string;
	created_at: number;
	message?: string;
}

/**
 * Shared props for the domains DataViews.
 */
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

/**
 * Props for the domains DataViews, extends the base props with additional properties.
 */
export type DomainsDataViewsProps =
	| ( BaseDomainsDataViewsProps & { isAllSitesView: true } )
	| ( BaseDomainsDataViewsProps & { isAllSitesView: false; siteSlug: string | null } );

/**
 * Context for the domains DataViews.
 */
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

/**
 * Extended domain data with additional fields.
 */
type DomainDataExtension = {
	site_slug: string;
	domain_status: {
		status: string;
		status_type: string;
		status_weight: number;
	};
};

/**
 * Domain data with extended definition.
 */
export type QueryDomainExtendedData = QueryDomainData & DomainDataExtension;

/**
 * Domain data with original and processed data.
 */
export type DomainData = {
	original: QueryDomainExtendedData;
	processed: ResponseDomain;
};

/**
 * Arguments for the domains query.
 */
export interface DomainsQueryArgs {
	no_wpcom?: boolean;
	resolve_status?: boolean;
	extended_data?: boolean;
}

/**
 * Data returned by the domains query function.
 */
export interface DomainsQueryFnData {
	domains: QueryDomainExtendedData[];
}
