import { useState } from 'react';
import { DomainsTableColumn, DomainsTableHeader } from '../domains-table-header';
import { DomainsTableRow } from './domains-table-row';
import type { PartialDomainData, SiteDomainsQueryFnData } from '@automattic/data-stores';
import './style.scss';

interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
	columns: DomainsTableColumn[];
	// Detailed domain data is fetched on demand. The ability to customise fetching
	// is provided to allow for testing.
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
}

export function DomainsTable( { domains, fetchSiteDomains, columns }: DomainsTableProps ) {
	const [ { sortKey, sortDirection }, setSort ] = useState< {
		sortKey: string;
		sortDirection: 'asc' | 'desc';
	} >( {
		sortKey: 'domain',
		sortDirection: 'asc',
	} );

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

	return (
		<table className="domains-table">
			<DomainsTableHeader
				columns={ columns }
				activeSortKey={ sortKey }
				activeSortDirection={ sortDirection }
				onChangeSortOrder={ ( selectedColumn ) => {
					onSortChange( selectedColumn );
				} }
			/>
			<tbody>
				{ domains.map( ( domain ) => (
					<DomainsTableRow
						key={ domain.domain }
						domain={ domain }
						fetchSiteDomains={ fetchSiteDomains }
					/>
				) ) }
			</tbody>
		</table>
	);
}
