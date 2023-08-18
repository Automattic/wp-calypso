import { useState, useCallback, useLayoutEffect } from 'react';
import { DomainsTableColumn, DomainsTableHeader } from '../domains-table-header';
import { domainsTableColumns } from '../domains-table-header/columns';
import { DomainsTableRow } from './domains-table-row';
import type { PartialDomainData, SiteDomainsQueryFnData } from '@automattic/data-stores';
import './style.scss';

interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
	isAllSitesView: boolean;

	// Detailed domain data is fetched on demand. The ability to customise fetching
	// is provided to allow for testing.
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
}

export function DomainsTable( { domains, fetchSiteDomains, isAllSitesView }: DomainsTableProps ) {
	const [ { sortKey, sortDirection }, setSort ] = useState< {
		sortKey: string;
		sortDirection: 'asc' | 'desc';
	} >( {
		sortKey: 'domain',
		sortDirection: 'asc',
	} );

	const [ selectedDomains, setSelectedDomains ] = useState< PartialDomainData[] >( [] );

	useLayoutEffect( () => {
		setSelectedDomains( [] );
	}, [ domains ] );

	const handleSelectDomain = useCallback(
		( domain: PartialDomainData ) => {
			if ( selectedDomains.includes( domain ) ) {
				setSelectedDomains(
					selectedDomains.filter( ( selectedDomain ) => selectedDomain !== domain )
				);
			} else {
				setSelectedDomains( [ ...selectedDomains, domain ] );
			}
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

	const hasSelectedDomains = selectedDomains.length > 0;
	const areAllDomainsSelected = domains.length === selectedDomains.length;

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
			setSelectedDomains( domains );
		} else {
			setSelectedDomains( [] );
		}
	};

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
						key={ domain.domain }
						domain={ domain }
						isSelected={ selectedDomains.includes( domain ) }
						onSelect={ handleSelectDomain }
						fetchSiteDomains={ fetchSiteDomains }
						isAllSitesView={ isAllSitesView }
					/>
				) ) }
			</tbody>
		</table>
	);
}
