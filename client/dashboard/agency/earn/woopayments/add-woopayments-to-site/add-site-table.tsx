import { RadioControl } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { DataViews } from '../../../../components/dataviews';
import { useFetchManagedSites, type WooPaymentsSiteItem } from './use-fetch-managed-sites';
import type { RecordTracksEvent } from '../types';
import type { Field, View } from '@wordpress/dataviews';

export type { WooPaymentsSiteItem };

interface AddWooPaymentsToSiteTableProps {
	agencyId: number;
	selectedSite: WooPaymentsSiteItem | null;
	setSelectedSite: ( site: WooPaymentsSiteItem | null ) => void;
	excludedSiteIds: number[];
	recordTracksEvent: RecordTracksEvent;
}

export default function AddWooPaymentsToSiteTable( {
	agencyId,
	selectedSite,
	setSelectedSite,
	excludedSiteIds,
	recordTracksEvent,
}: AddWooPaymentsToSiteTableProps ) {
	const { items, isLoading } = useFetchManagedSites( agencyId );

	const availableSites = useMemo(
		() => items.filter( ( item ) => ! excludedSiteIds.includes( item.rawSite.blog_id ) ),
		[ items, excludedSiteIds ]
	);

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 50,
		search: '',
		filters: [],
		sort: { field: '', direction: 'asc' },
		fields: [ 'site' ],
		layout: { density: 'compact' },
	} );

	const onSelectSite = useCallback(
		( item: WooPaymentsSiteItem ) => {
			setSelectedSite( item );
			recordTracksEvent( 'calypso_a4a_woopayments_add_site_table_select_site_click' );
		},
		[ setSelectedSite, recordTracksEvent ]
	);

	const fields = useMemo< Field< WooPaymentsSiteItem >[] >(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item } ) => item.site,
				render: ( { item } ) => (
					<RadioControl
						selected={ selectedSite?.id === item.id ? String( item.id ) : '' }
						options={ [ { label: item.site, value: String( item.id ) } ] }
						onChange={ () => onSelectSite( item ) }
					/>
				),
				enableGlobalSearch: true,
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ onSelectSite, selectedSite?.id ]
	);

	const { data, paginationInfo } = useMemo(
		() => filterSortAndPaginate( availableSites, view, fields ),
		[ availableSites, view, fields ]
	);

	return (
		<DataViews< WooPaymentsSiteItem >
			data={ data }
			getItemId={ ( item ) => `${ item.id }` }
			paginationInfo={ paginationInfo }
			fields={ fields }
			view={ view }
			onChangeView={ setView }
			isLoading={ isLoading }
			defaultLayouts={ { table: {} } }
		/>
	);
}
