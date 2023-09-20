import {
	DomainData,
	getSiteDomainsQueryObject,
	PartialDomainData,
	SiteDetails,
	SiteDomainsQueryFnData,
	useDomainsBulkActionsMutation,
	DomainUpdateStatus,
	JobStatus,
	BulkUpdateVariables,
	AllDomainsQueryFnData,
	BulkDomainUpdateStatusQueryFnData,
	AllDomainsQueryArgs,
} from '@automattic/data-stores';
import { useFuzzySearch } from '@automattic/search';
import { isMobile } from '@automattic/viewport';
import { useQueries } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
	createContext,
	useContext,
	ReactNode,
} from 'react';
import { DomainsTableFilter } from '../domains-table-filters/index';
import {
	allSitesViewColumns,
	siteSpecificViewColumns,
	applyColumnSort,
} from '../domains-table-header/columns';
import { DomainsTableColumn } from '../domains-table-header/index';
import { getDomainId } from '../get-domain-id';
import { useDomainBulkUpdateStatus } from '../use-domain-bulk-update-status';
import { shouldHideOwnerColumn } from '../utils';
import { canBulkUpdate } from '../utils/can-bulk-update';
import { DomainStatusPurchaseActions } from '../utils/resolve-domain-status';
import { ResponseDomain } from '../utils/types';
import { DomainAction } from './domains-table-row-actions';

type DomainActionDescription = {
	message?: string;
	action: () => void | Promise< void >;
};

type OnDomainAction = (
	action: DomainAction,
	domain: ResponseDomain
) => DomainActionDescription | void;

interface BaseDomainsTableProps {
	domains: PartialDomainData[] | undefined;
	isAllSitesView: boolean;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
	onDomainAction?: OnDomainAction;
	userCanSetPrimaryDomains?: boolean;
	shouldDisplayContactInfoBulkAction?: boolean;
	isFetchingDomains?: boolean;

	// These props allow table users to provide their own fetching functions. This is used for
	// testing and for Calypso to provide functions that handle authentication in a special way.
	fetchAllDomains?: ( queryArgs?: AllDomainsQueryArgs ) => Promise< AllDomainsQueryFnData >;
	fetchSite?: ( siteIdOrSlug: number | string | null | undefined ) => Promise< SiteDetails >;
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
	createBulkAction?: ( variables: BulkUpdateVariables ) => Promise< void >;
	fetchBulkActionStatus?: () => Promise< BulkDomainUpdateStatusQueryFnData >;
	deleteBulkActionStatus?: () => Promise< void >;
	currentUserCanBulkUpdateContactInfo?: boolean;
}

export type DomainsTablePropsNoChildren =
	| ( BaseDomainsTableProps & { isAllSitesView: true } )
	| ( BaseDomainsTableProps & { isAllSitesView: false; siteSlug: string | null } );

export type DomainsTableProps = DomainsTablePropsNoChildren & { children: ReactNode | ReactNode[] };

interface DomainsTableUpdatingDomain {
	action: DomainAction;
	domain: string;
	created_at: number;
	message?: string;
}

type Value = {
	isFetchingDomains?: boolean;
	filter: DomainsTableFilter;
	setFilter: (
		value: ( ( prevState: DomainsTableFilter ) => DomainsTableFilter ) | DomainsTableFilter
	) => void;
	filteredData: PartialDomainData[];
	fetchAllDomains?: ( queryArgs?: AllDomainsQueryArgs ) => Promise< AllDomainsQueryFnData >;
	fetchSite?: ( siteIdOrSlug: number | string | null | undefined ) => Promise< SiteDetails >;
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
	createBulkAction?: ( variables: BulkUpdateVariables ) => Promise< void >;
	fetchBulkActionStatus?: () => Promise< BulkDomainUpdateStatusQueryFnData >;
	deleteBulkActionStatus?: () => Promise< void >;
	isAllSitesView: boolean;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
	hideOwnerColumn: boolean;
	canSelectAnyDomains: boolean;
	domainsRequiringAttention?: number;
	sortKey: string;
	sortDirection: 'asc' | 'desc';
	handleAutoRenew: ( enable: boolean ) => void;
	handleUpdateContactInfo: () => void;
	changeBulkSelection: () => void;
	getBulkSelectionStatus: () => 'all-domains' | 'some-domains' | 'no-domains';
	onSortChange: ( selectedColumn: DomainsTableColumn, direction?: 'asc' | 'desc' ) => void;
	handleSelectDomain: ( domain: PartialDomainData ) => void;
	onDomainsRequiringAttentionChange: ( domainsRequiringAttention: number ) => void;
	selectedDomains: Set< string >;
	hasSelectedDomains: boolean;
	completedJobs: JobStatus[];
	domainResults: Map< string, DomainUpdateStatus[] >;
	handleRestartDomainStatusPolling: () => void;
	showBulkActions: boolean;
	setShowBulkActions: ( showBulkActions: boolean ) => void;
	onDomainAction( ...parameters: Parameters< OnDomainAction > ): void;
	updatingDomain: DomainsTableUpdatingDomain | null;
	userCanSetPrimaryDomains: BaseDomainsTableProps[ 'userCanSetPrimaryDomains' ];
	shouldDisplayContactInfoBulkAction: boolean;
	domainsTableColumns: DomainsTableColumn[];
	currentUsersOwnsAllSelectedDomains: boolean;
	currentUserCanBulkUpdateContactInfo: boolean;
};

const Context = createContext< Value | undefined >( undefined );

export const useDomainsTable = () => useContext( Context ) as Value;

export const DomainsTable = ( props: DomainsTableProps ) => {
	const {
		domains: allDomains,
		fetchAllDomains,
		fetchSite,
		fetchSiteDomains,
		createBulkAction,
		fetchBulkActionStatus,
		deleteBulkActionStatus,
		isAllSitesView,
		domainStatusPurchaseActions,
		children,
		onDomainAction,
		userCanSetPrimaryDomains,
		shouldDisplayContactInfoBulkAction = true,
		isFetchingDomains,
		currentUserCanBulkUpdateContactInfo = false,
	} = props;

	const [ { sortKey, sortDirection }, setSort ] = useState< {
		sortKey: string;
		sortDirection: 'asc' | 'desc';
	} >( {
		sortKey: 'domain',
		sortDirection: 'asc',
	} );

	const [ showBulkActions, setShowBulkActions ] = useState( Boolean( ! isMobile() ) );
	const [ selectedDomains, setSelectedDomains ] = useState( () => new Set< string >() );
	const [ filter, setFilter ] = useState< DomainsTableFilter >( () => ( { query: '' } ) );
	const [ domainsRequiringAttention, setDomainsRequiringAttention ] = useState<
		number | undefined
	>( undefined );

	const domains = useMemo( () => {
		if ( isAllSitesView || ! allDomains ) {
			return allDomains;
		}

		const hasWpcomStagingDomain = allDomains.find( ( domain ) => domain.is_wpcom_staging_domain );

		if ( ! hasWpcomStagingDomain ) {
			return allDomains;
		}

		return allDomains.filter( ( domain ) => {
			if ( domain.wpcom_domain ) {
				return domain.is_wpcom_staging_domain;
			}

			return true;
		} );
	}, [ allDomains, isAllSitesView ] );

	const allSiteIds = [ ...new Set( domains?.map( ( { blog_id } ) => blog_id ) ?? [] ) ];
	const allSiteDomains = useQueries( {
		queries: allSiteIds.map( ( siteId ) =>
			getSiteDomainsQueryObject( siteId, {
				...( fetchSiteDomains && { queryFn: () => fetchSiteDomains( siteId ) } ),
			} )
		),
	} );
	const fetchedSiteDomains = useMemo( () => {
		const fetchedSiteDomains: Record< number, DomainData[] > = {};
		for ( const { data } of allSiteDomains ) {
			const siteId = data?.domains?.[ 0 ]?.blog_id;
			if ( typeof siteId === 'number' ) {
				fetchedSiteDomains[ siteId ] = data?.domains ?? [];
			}
		}
		return fetchedSiteDomains;
	}, [ allSiteDomains ] );

	const { setAutoRenew } = useDomainsBulkActionsMutation(
		createBulkAction && { mutationFn: createBulkAction }
	);

	const { completedJobs, domainResults, handleRestartDomainStatusPolling } =
		useDomainBulkUpdateStatus( fetchBulkActionStatus );

	useLayoutEffect( () => {
		if ( ! domains ) {
			setSelectedDomains( new Set() );
			return;
		}

		setSelectedDomains( ( selectedDomains ) => {
			const domainIds = domains.map( getDomainId );
			const selectedDomainsCopy = new Set( selectedDomains );

			for ( const selectedDomain of selectedDomainsCopy ) {
				if ( ! domainIds.includes( selectedDomain ) ) {
					selectedDomainsCopy.delete( selectedDomain );
				}
			}

			return selectedDomainsCopy;
		} );
	}, [ domains ] );
	const translate = useTranslate();
	const domainsTableColumns = isAllSitesView
		? allSitesViewColumns( translate, domainStatusPurchaseActions )
		: siteSpecificViewColumns( translate, domainStatusPurchaseActions );

	const sortedDomains = useMemo( () => {
		if ( ! domains ) {
			return;
		}

		return applyColumnSort(
			domains,
			fetchedSiteDomains,
			domainsTableColumns,
			sortKey,
			sortDirection
		);
	}, [ fetchedSiteDomains, domains, sortKey, sortDirection, domainsTableColumns ] );

	const filteredData = useFuzzySearch( {
		data: sortedDomains ?? [],
		keys: [ 'domain' ],
		query: filter.query,
		options: {
			threshold: 0.3,
		},
	} );
	const onDomainsRequiringAttentionChange = useCallback( ( domainsRequiringAttention: number ) => {
		setDomainsRequiringAttention( domainsRequiringAttention );
	}, [] );

	const handleSelectDomain = useCallback(
		( domain: PartialDomainData ) => {
			const domainId = getDomainId( domain );
			const selectedDomainsCopy = new Set( selectedDomains );

			if ( selectedDomainsCopy.has( domainId ) ) {
				selectedDomainsCopy.delete( domainId );
			} else {
				selectedDomainsCopy.add( domainId );
			}

			setSelectedDomains( selectedDomainsCopy );
		},
		[ setSelectedDomains, selectedDomains ]
	);

	const [ updatingDomain, setUpdatingDomain ] = useState< Value[ 'updatingDomain' ] >( null );

	const onSortChange = ( selectedColumn: DomainsTableColumn, direction?: 'asc' | 'desc' ) => {
		if ( ! selectedColumn.isSortable ) {
			return;
		}

		const newSortDirection =
			direction ||
			( selectedColumn.name === sortKey &&
			selectedColumn.supportsOrderSwitching &&
			sortDirection === 'asc'
				? 'desc'
				: 'asc' );

		setSort( {
			sortKey: selectedColumn.name,
			sortDirection: newSortDirection,
		} );
	};

	const hasSelectedDomains = selectedDomains.size > 0;
	const selectableDomains = ( domains ?? [] ).filter( canBulkUpdate );
	const canSelectAnyDomains = selectableDomains.length > 0;
	const areAllDomainsSelected = selectableDomains.length === selectedDomains.size;

	const getBulkSelectionStatus = () => {
		if ( hasSelectedDomains && areAllDomainsSelected ) {
			return 'all-domains';
		}

		if ( hasSelectedDomains && ! areAllDomainsSelected ) {
			return 'some-domains';
		}

		return 'no-domains';
	};

	const changeBulkSelection = () => {
		if ( filter.query ) {
			if ( ! hasSelectedDomains ) {
				setSelectedDomains( new Set( filteredData.filter( canBulkUpdate ).map( getDomainId ) ) );
			} else {
				setSelectedDomains( new Set() );
			}

			return;
		}

		if ( ! hasSelectedDomains || ! areAllDomainsSelected ) {
			// filter out unselectable domains from bulk selection
			setSelectedDomains( new Set( ( domains ?? [] ).filter( canBulkUpdate ).map( getDomainId ) ) );
		} else {
			setSelectedDomains( new Set() );
		}
	};

	const handleAutoRenew = ( enable: boolean ) => {
		const domainsToBulkUpdate = ( domains ?? [] )
			.filter( ( domain ) => selectedDomains.has( getDomainId( domain ) ) )
			.map( ( domain ) => domain.domain );
		setAutoRenew( domainsToBulkUpdate, enable );
		handleRestartDomainStatusPolling();
	};

	const handleUpdateContactInfo = () => {
		const domainsToBulkUpdate = ( domains ?? [] ).filter( ( domain ) =>
			selectedDomains.has( getDomainId( domain ) )
		);

		const baseUrl = isAllSitesView
			? '/domains/manage/all/edit-selected-contact-info'
			: `/domains/manage/edit-selected-contact-info/${ props.siteSlug }`;

		const formLink = addQueryArgs( baseUrl, {
			selected: domainsToBulkUpdate.map( ( { domain } ) => domain ),
		} );

		page( formLink );
	};

	const hideOwnerColumn = shouldHideOwnerColumn(
		Object.values< DomainData[] >( fetchedSiteDomains ).flat()
	);

	const currentUsersOwnsAllSelectedDomains = ! Array.from( selectedDomains ).some( ( selected ) =>
		( domains ?? [] ).find(
			( domain ) => getDomainId( domain ) === selected && ! domain.current_user_is_owner
		)
	);

	const value: Value = {
		filter,
		setFilter,
		fetchAllDomains,
		fetchSite,
		fetchSiteDomains,
		createBulkAction,
		fetchBulkActionStatus,
		deleteBulkActionStatus,
		isAllSitesView,
		domainStatusPurchaseActions,
		hideOwnerColumn,
		canSelectAnyDomains,
		domainsRequiringAttention,
		sortKey,
		sortDirection,
		handleAutoRenew,
		handleUpdateContactInfo,
		changeBulkSelection,
		getBulkSelectionStatus,
		onSortChange,
		handleSelectDomain,
		onDomainsRequiringAttentionChange,
		filteredData,
		selectedDomains,
		hasSelectedDomains,
		currentUsersOwnsAllSelectedDomains,
		completedJobs,
		domainResults,
		handleRestartDomainStatusPolling,
		showBulkActions,
		setShowBulkActions,
		onDomainAction: async ( actionType, domain ) => {
			const actionDescription = onDomainAction?.( actionType, domain );

			if ( ! actionDescription ) {
				return;
			}

			const { action, message } = actionDescription;

			setUpdatingDomain( {
				action: actionType,
				domain: domain.domain,
				created_at: new Date().valueOf() / 1000,
				message,
			} );

			await action();

			setUpdatingDomain( null );
		},
		updatingDomain,
		userCanSetPrimaryDomains,
		shouldDisplayContactInfoBulkAction,
		domainsTableColumns,
		isFetchingDomains,
		currentUserCanBulkUpdateContactInfo,
	};

	return (
		<Context.Provider value={ value }>
			<div className="domains-table">{ children }</div>
		</Context.Provider>
	);
};
