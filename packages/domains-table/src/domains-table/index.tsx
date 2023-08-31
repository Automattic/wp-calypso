import {
	type DomainData,
	type PartialDomainData,
	type SiteDomainsQueryFnData,
	type SiteDetails,
	getSiteDomainsQueryObject,
	useDomainsBulkActionsMutation,
} from '@automattic/data-stores';
import { useFuzzySearch } from '@automattic/search';
import { useQueries } from '@tanstack/react-query';
import { useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { BulkActionsToolbar } from '../bulk-actions-toolbar';
import { DomainsTableFilters, DomainsTableFilter } from '../domains-table-filters';
import { DomainsTableColumn, DomainsTableHeader } from '../domains-table-header';
import { domainsTableColumns } from '../domains-table-header/columns';
import { getDomainId } from '../get-domain-id';
import { shouldHideOwnerColumn } from '../utils';
import { DomainStatusPurchaseActions } from '../utils/resolve-domain-status';
import { DomainsTableRow } from './domains-table-row';
import './style.scss';

interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
	isAllSitesView: boolean;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;

	// Detailed domain data is fetched on demand. The ability to customise fetching
	// is provided to allow for testing.
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
	fetchSite?: ( siteIdOrSlug: number | string | null | undefined ) => Promise< SiteDetails >;
}

export function DomainsTable( {
	domains,
	fetchSiteDomains,
	fetchSite,
	isAllSitesView,
	domainStatusPurchaseActions,
}: DomainsTableProps ) {
	const [ { sortKey, sortDirection }, setSort ] = useState< {
		sortKey: string;
		sortDirection: 'asc' | 'desc';
	} >( {
		sortKey: 'domain',
		sortDirection: 'asc',
	} );

	const [ selectedDomains, setSelectedDomains ] = useState( () => new Set< string >() );
	const [ filter, setFilter ] = useState< DomainsTableFilter >( () => ( { query: '' } ) );
	const [ domainsRequiringAttention, setDomainsRequiringAttention ] = useState<
		number | undefined
	>( undefined );

	const allSiteIds = [ ...new Set( domains?.map( ( { blog_id } ) => blog_id ) || [] ) ];
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
				fetchedSiteDomains[ siteId ] = data?.domains || [];
			}
		}
		return fetchedSiteDomains;
	}, [ allSiteDomains ] );

	const { setAutoRenew } = useDomainsBulkActionsMutation();

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

	const sortedDomains = useMemo( () => {
		const selectedColumnDefinition = domainsTableColumns.find(
			( column ) => column.name === sortKey
		);

		const getFullDomainData = ( domain: PartialDomainData ) =>
			fetchedSiteDomains?.[ domain.blog_id ]?.find( ( d ) => d.domain === domain.domain );

		return domains?.sort( ( first, second ) => {
			let result = 0;

			const fullFirst = getFullDomainData( first );
			const fullSecond = getFullDomainData( second );
			if ( ! fullFirst || ! fullSecond ) {
				return result;
			}

			for ( const sortFunction of selectedColumnDefinition?.sortFunctions || [] ) {
				result = sortFunction( fullFirst, fullSecond, sortDirection === 'asc' ? 1 : -1 );
				if ( result !== 0 ) {
					break;
				}
			}
			return result;
		} );
	}, [ fetchedSiteDomains, domains, sortKey, sortDirection ] );

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

	if ( ! domains ) {
		return null;
	}

	const onSortChange = ( selectedColumn: DomainsTableColumn ) => {
		if ( ! selectedColumn.isSortable ) {
			return;
		}

		const newSortDirection =
			selectedColumn.name === sortKey &&
			selectedColumn.supportsOrderSwitching &&
			sortDirection === 'asc'
				? 'desc'
				: selectedColumn.initialSortDirection;

		setSort( {
			sortKey: selectedColumn.name,
			sortDirection: newSortDirection,
		} );
	};

	const hasSelectedDomains = selectedDomains.size > 0;
	const selectableDomains = domains.filter( ( domain ) => ! domain.wpcom_domain );
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
				setSelectedDomains(
					new Set( filteredData.filter( ( domain ) => ! domain.wpcom_domain ).map( getDomainId ) )
				);
			} else {
				setSelectedDomains( new Set() );
			}

			return;
		}

		if ( ! hasSelectedDomains || ! areAllDomainsSelected ) {
			// filter out wpcom domains from bulk selection
			setSelectedDomains(
				new Set( domains.filter( ( domain ) => ! domain.wpcom_domain ).map( getDomainId ) )
			);
		} else {
			setSelectedDomains( new Set() );
		}
	};

	const handlAutoRenew = ( enable: boolean ) => {
		const domainsToBulkUpdate = domains
			.filter( ( domain ) => selectedDomains.has( getDomainId( domain ) ) )
			.map( ( domain ) => domain.domain );
		setAutoRenew( domainsToBulkUpdate, enable );
	};

	const hideOwnerColumn = shouldHideOwnerColumn(
		Object.values< DomainData[] >( fetchedSiteDomains ).flat()
	);

	return (
		<div className="domains-table">
			{ hasSelectedDomains ? (
				<BulkActionsToolbar
					onAutoRenew={ handlAutoRenew }
					selectedDomainCount={ selectedDomains.size }
				/>
			) : (
				<DomainsTableFilters
					onSearch={ ( query ) => setFilter( ( filter ) => ( { ...filter, query } ) ) }
					filter={ filter }
				/>
			) }

			<table>
				<DomainsTableHeader
					columns={ domainsTableColumns }
					activeSortKey={ sortKey }
					activeSortDirection={ sortDirection }
					bulkSelectionStatus={ getBulkSelectionStatus() }
					onBulkSelectionChange={ changeBulkSelection }
					onChangeSortOrder={ onSortChange }
					hideOwnerColumn={ hideOwnerColumn }
					domainsRequiringAttention={ domainsRequiringAttention }
					canSelectAnyDomains={ canSelectAnyDomains }
				/>
				<tbody>
					{ filteredData.map( ( domain ) => (
						<DomainsTableRow
							key={ getDomainId( domain ) }
							domain={ domain }
							isSelected={ selectedDomains.has( getDomainId( domain ) ) }
							onSelect={ handleSelectDomain }
							fetchSiteDomains={ fetchSiteDomains }
							fetchSite={ fetchSite }
							isAllSitesView={ isAllSitesView }
							domainStatusPurchaseActions={ domainStatusPurchaseActions }
							hideOwnerColumn={ hideOwnerColumn }
							onDomainsRequiringAttentionChange={ onDomainsRequiringAttentionChange }
						/>
					) ) }
				</tbody>
			</table>
		</div>
	);
}
