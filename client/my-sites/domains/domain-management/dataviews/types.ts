import {
	DomainUpdateStatus,
	JobStatus,
	BulkUpdateVariables,
	BulkDomainUpdateStatusQueryFnData,
	PartialDomainData,
} from '@automattic/data-stores';
import { SiteDomainsQueryFnData } from '@automattic/data-stores/src/queries/use-site-domains-query';
import { DomainStatusPurchaseActions, ResponseDomain } from '@automattic/domains-table';
import { DomainAction } from '@automattic/domains-table/src/domains-table/domains-table-row-actions';
import { SiteExcerptData } from '@automattic/sites';
import { QueryParams } from './query-params';

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
export type OnDomainAction = (
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

type DomainsDataViewUsage = 'domains' | 'site' | string;

/**
 * Base props for the domains DataViews.
 */
interface BaseDomainsDataViewsProps {
	className?: string;
	domains: PartialDomainData[] | undefined;
	isLoading: boolean;
	selectedItem: PartialDomainData | null | undefined;
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
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
	createBulkAction?: ( variables: BulkUpdateVariables ) => Promise< void >;
	fetchBulkActionStatus?: () => Promise< BulkDomainUpdateStatusQueryFnData >;
	deleteBulkActionStatus?: () => Promise< void >;
	currentUserCanBulkUpdateContactInfo?: boolean;
	hasConnectableSites?: boolean;
	context?: DomainsDataViewUsage;
	queryParams: QueryParams;
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
	getFullDomain: ( domain: PartialDomainData ) => ResponseDomain | undefined;
	getSiteSlug: ( domain: PartialDomainData ) => string;
	isLoadingSites?: boolean;
	isLoadingDomains?: boolean;
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
	createBulkAction?: ( variables: BulkUpdateVariables ) => Promise< void >;
	fetchBulkActionStatus?: () => Promise< BulkDomainUpdateStatusQueryFnData >;
	deleteBulkActionStatus?: () => Promise< void >;
	isAllSitesView: boolean;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
	domainsRequiringAttention?: number;
	handleAutoRenew: ( domains: PartialDomainData[], enable: boolean ) => void;
	handleUpdateContactInfo: ( domains: PartialDomainData[] ) => void;
	onDomainsRequiringAttentionChange: ( domainsRequiringAttention: number ) => void;
	completedJobs: JobStatus[];
	domainResults: Map< string, DomainUpdateStatus[] >;
	handleRestartDomainStatusPolling: () => void;
	onDomainAction( ...parameters: Parameters< OnDomainAction > ): void;
	updatingDomain: DomainsDataViewsUpdatingDomain | null;
	userCanSetPrimaryDomains: BaseDomainsDataViewsProps[ 'userCanSetPrimaryDomains' ];
	isDesktop: boolean;
	selectedFeature?: string;
	hasConnectableSites: boolean;
	context?: DomainsDataViewUsage;
}
