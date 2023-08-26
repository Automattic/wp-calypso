import {
	type DomainData,
	type PartialDomainData,
	type SiteDomainsQueryFnData,
	type SiteDetails,
	getSiteDomainsQueryObject,
	useDomainsBulkActionsMutation,
} from '@automattic/data-stores';
import { useQueries } from '@tanstack/react-query';
import { useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { BulkActionsToolbar } from '../bulk-actions-toolbar';
import { DomainsTableColumn, DomainsTableHeader } from '../domains-table-header';
import { domainsTableColumns } from '../domains-table-header/columns';
import { getDomainId } from '../get-domain-id';
import { DomainStatusPurchaseActions } from '../utils/resolve-domain-status';
import { DomainsTableRow } from './domains-table-row';
import './style.scss';

interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
	isAllSitesView: boolean;
	dispatch: any;
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
	const areAllDomainsSelected = domains.length === selectedDomains.size;

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
		if ( ! hasSelectedDomains || ! areAllDomainsSelected ) {
			setSelectedDomains( new Set( domains.map( getDomainId ) ) );
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

	return (
		<div className="domains-table">
			{ hasSelectedDomains && (
				<BulkActionsToolbar
					onAutoRenew={ handlAutoRenew }
					selectedDomainCount={ selectedDomains.size }
				/>
			) }
			{ /* This spacer will be replaced by searching and filtering controls. In the meantime it stops the table jumping around when selecting domains. */ }
			{ ! hasSelectedDomains && <div style={ { height: 40 } } /> }
			<table>
				<DomainsTableHeader
					columns={ domainsTableColumns }
					activeSortKey={ sortKey }
					activeSortDirection={ sortDirection }
					bulkSelectionStatus={ getBulkSelectionStatus() }
					onBulkSelectionChange={ changeBulkSelection }
					onChangeSortOrder={ onSortChange }
				/>
				<tbody>
					{ sortedDomains?.map( ( domain ) => (
						<DomainsTableRow
							key={ getDomainId( domain ) }
							domain={ domain }
							isSelected={ selectedDomains.has( getDomainId( domain ) ) }
							onSelect={ handleSelectDomain }
							fetchSiteDomains={ fetchSiteDomains }
							fetchSite={ fetchSite }
							isAllSitesView={ isAllSitesView }
							domainStatusPurchaseActions={ domainStatusPurchaseActions }
						/>
					) ) }
				</tbody>
			</table>
		</div>
	);
}
