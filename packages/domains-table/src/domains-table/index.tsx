import {
	type PartialDomainData,
	type SiteDomainsQueryFnData,
	type SiteDetails,
	useDomainsBulkActionsMutation,
} from '@automattic/data-stores';
import { useState, useCallback, useLayoutEffect } from 'react';
import { BulkActionsToolbar } from '../bulk-actions-toolbar';
import { DomainsTableColumn, DomainsTableHeader } from '../domains-table-header';
import { domainsTableColumns } from '../domains-table-header/columns';
import { getDomainId } from '../get-domain-id';
import { Sorting } from '../use-sort-state';
import { DomainsTableRow } from './domains-table-row';
import './style.scss';

export interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
	sorting: Sorting;
	onSortChange: ( selectedColumn: DomainsTableColumn ) => void;
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
	sorting: { sortKey, sortDirection },
	onSortChange,
	fetchSiteDomains,
	fetchSite,
	isAllSitesView,
}: DomainsTableProps ) {
	const [ selectedDomains, setSelectedDomains ] = useState( () => new Set< string >() );

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
		</div>
	);
}
