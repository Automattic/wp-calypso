import { RadioControl } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { DataViews } from '../../../../components/dataviews';
import { useFetchManagedSites, type WooPaymentsSiteItem } from './use-fetch-managed-sites';
import type { Field, View } from '@wordpress/dataviews';

export type { WooPaymentsSiteItem };

interface AddWooPaymentsToSiteTableProps {
	selectedSite: WooPaymentsSiteItem | null;
	setSelectedSite: ( site: WooPaymentsSiteItem | null ) => void;
	excludedSiteIds: number[];
}

export default function AddWooPaymentsToSiteTable( {
	selectedSite,
	setSelectedSite,
	excludedSiteIds,
}: AddWooPaymentsToSiteTableProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { items, isLoading } = useFetchManagedSites();

	// Sites that already have WooPayments are excluded from the picker.
	const availableSites = useMemo(
		() => items.filter( ( item ) => ! excludedSiteIds.includes( item.rawSite.blog_id ) ),
		[ items, excludedSiteIds ]
	);

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		search: '',
		filters: [],
		sort: { field: '', direction: 'asc' },
		fields: [ 'site' ],
	} );

	const onSelectSite = useCallback(
		( item: WooPaymentsSiteItem ) => {
			setSelectedSite( item );
			recordTracksEvent( 'calypso_a8c_woopayments_add_site_table_select_site_click' );
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
