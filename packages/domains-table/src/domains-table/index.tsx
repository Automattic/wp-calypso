import { useState, useCallback, useLayoutEffect } from 'react';
import { DomainsTableColumn, DomainsTableHeader } from '../domains-table-header';
import { domainsTableColumns } from '../domains-table-header/columns';
import { getDomainId } from '../get-domain-id';
import { DomainsTableRow } from './domains-table-row';
import type {
	DomainData,
	PartialDomainData,
	SiteDomainsQueryFnData,
	SiteDetails,
} from '@automattic/data-stores';
import './style.scss';

interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
	isAllSitesView: boolean;

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
}: DomainsTableProps ) {
	const [ { sortKey, sortDirection }, setSort ] = useState< {
		sortKey: string;
		sortDirection: 'asc' | 'desc';
	} >( {
		sortKey: 'domain',
		sortDirection: 'asc',
	} );

	const [ selectedDomains, setSelectedDomains ] = useState( () => new Set< string >() );

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

	const selectedColumnDefinition = domainsTableColumns.find(
		( column ) => column.name === sortKey
	);

	if ( sortKey && sortDirection ) {
		domains.sort( ( first, second ) => {
			let result = 0;
			for ( const sortFunction of selectedColumnDefinition?.sortFunctions || [] ) {
				result = sortFunction(
					first as DomainData, //type was casted to fix type error, this will be removed once the type is fixed
					second as DomainData,
					sortDirection === 'asc' ? 1 : -1
				);
				if ( 0 !== result ) {
					break;
				}
			}
			return result;
		} );
	}

	return (
		<table className="domains-table">
			<DomainsTableHeader
				columns={ domainsTableColumns }
				activeSortKey={ sortKey }
				activeSortDirection={ sortDirection }
				bulkSelectionStatus={ getBulkSelectionStatus() }
				onBulkSelectionChange={ changeBulkSelection }
				onChangeSortOrder={ ( selectedColumn ) => {
					onSortChange( selectedColumn );
				} }
			/>
			<tbody>
				{ domains.map( ( domain ) => (
					<DomainsTableRow
						key={ getDomainId( domain ) }
						domain={ domain }
						isSelected={ selectedDomains.has( getDomainId( domain ) ) }
						onSelect={ handleSelectDomain }
						fetchSiteDomains={ fetchSiteDomains }
						fetchSite={ fetchSite }
						isAllSitesView={ isAllSitesView }
					/>
				) ) }
			</tbody>
		</table>
	);
}
