import { agencySitesQuery, paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { SearchControl, __experimentalVStack as VStack } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useWooPaymentsDashboardData } from '../use-woopayments-dashboard-data';
import type { RecordTracksEvent } from '../types';
import type { AgencySite } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

const PER_PAGE = 10;
// Probe request used only to learn the total number of agency sites. This mirrors the
// classic table's two-phase `useFetchAllManagedSites` fetch: read the total first, then
// fetch every site in a single follow-up request, filtering/paginating client-side.
const COUNT_PROBE_PER_PAGE = 1;

const fields: Field< AgencySite >[] = [
	{
		id: 'url',
		label: __( 'Site' ),
		enableGlobalSearch: true,
		enableHiding: false,
		enableSorting: false,
		getValue: ( { item } ) => item.url,
	},
];

export default function AddWooPaymentsToSiteTable( {
	selectedSite,
	onSelectSite,
	recordTracksEvent = () => {},
}: {
	selectedSite: AgencySite | null;
	onSelectSite: ( site: AgencySite | null ) => void;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const { sites: connectedSites } = useWooPaymentsDashboardData();

	const { data: countProbe, isLoading: isCountLoading } = useQuery(
		paginatedAgencySitesQuery( { per_page: COUNT_PROBE_PER_PAGE } )
	);
	const total = countProbe?.total ?? 0;
	const { data: allSites = [], isLoading: isSitesLoading } = useQuery( {
		...agencySitesQuery( { per_page: total } ),
		enabled: total > 0,
	} );
	const isLoading = isCountLoading || ( total > 0 && isSitesLoading );

	const excludedSiteIds = useMemo(
		() => new Set( connectedSites.map( ( site ) => site.blogId ) ),
		[ connectedSites ]
	);

	const availableSites = useMemo(
		() => allSites.filter( ( site ) => ! excludedSiteIds.has( site.blog_id ) ),
		[ allSites, excludedSiteIds ]
	);

	const [ view, setView ] = useState< View >( {
		type: 'list',
		perPage: PER_PAGE,
		search: '',
		fields: [],
		titleField: 'url',
	} );

	const { data: pagedSites, paginationInfo } = useMemo(
		() => filterSortAndPaginate( availableSites, view, fields ),
		[ availableSites, view ]
	);

	const selection = selectedSite ? [ selectedSite.blog_id.toString() ] : [];

	const handleSelectionChange = ( newSelection: string[] ) => {
		const site = availableSites.find( ( item ) => item.blog_id.toString() === newSelection[ 0 ] );
		onSelectSite( site ?? null );
		if ( site ) {
			recordTracksEvent( 'calypso_a8c_woopayments_add_site_table_select_site_click' );
		}
	};

	return (
		<VStack spacing={ 4 }>
			<SearchControl
				__nextHasNoMarginBottom
				size="compact"
				value={ view.search }
				onChange={ ( search ) => setView( { ...view, search, page: 1 } ) }
			/>
			<DataViews< AgencySite >
				data={ pagedSites }
				fields={ fields }
				view={ view }
				paginationInfo={ paginationInfo }
				getItemId={ ( site ) => site.blog_id.toString() }
				defaultLayouts={ { list: {} } }
				onChangeView={ setView }
				selection={ selection }
				onChangeSelection={ handleSelectionChange }
				isLoading={ isLoading }
				empty={ <p>{ view.search ? __( 'No sites found' ) : __( 'No sites' ) }</p> }
			>
				<DataViews.Layout />
			</DataViews>
		</VStack>
	);
}
