import { __experimentalHStack as HStack, RadioControl } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import A4ATablePlaceholder from 'calypso/a8c-for-agencies/components/a4a-table-placeholder';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { DataViews } from 'calypso/components/dataviews';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useWooPaymentsContext } from '../context';
import { useFetchManagedSites, type WooPaymentsSiteItem } from './use-fetch-managed-sites';

export type { WooPaymentsSiteItem };

const AddWooPaymentsToSiteTable = ( {
	selectedSite,
	setSelectedSite,
}: {
	selectedSite: WooPaymentsSiteItem | null;
	setSelectedSite: ( site: WooPaymentsSiteItem | null ) => void;
} ) => {
	const dispatch = useDispatch();

	const { items, isLoading } = useFetchManagedSites();

	const { sitesWithPluginsStates: excludedSites } = useWooPaymentsContext();

	const excludedSitesIds = useMemo(
		() => excludedSites?.map( ( site ) => site.blogId ) || [],
		[ excludedSites ]
	);

	// Filter out sites that are already tagged
	const availableSites = useMemo( () => {
		return items.filter( ( item ) => ! excludedSitesIds.includes( item?.rawSite.blog_id ) );
	}, [ items, excludedSitesIds ] );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site' ],
		layout: { density: 'compact' },
	} );

	const onSelectSite = useCallback(
		( item: WooPaymentsSiteItem ) => {
			setSelectedSite( item );
			dispatch( recordTracksEvent( 'calypso_a8c_woopayments_add_site_table_select_site_click' ) );
		},
		[ dispatch, setSelectedSite ]
	);

	const fields = useMemo( () => {
		const siteColumn = {
			id: 'site',
			label: __( 'Site' ),
			getValue: ( { item }: { item: WooPaymentsSiteItem } ) => item.site,
			render: ( { item }: { item: WooPaymentsSiteItem } ) => (
				<RadioControl
					selected={ selectedSite?.id === item.id ? String( item.id ) : '' }
					options={ [ { label: item.site, value: String( item.id ) } ] }
					onChange={ () => onSelectSite( item ) }
				/>
			),
			enableGlobalSearch: true,
			enableHiding: false,
			enableSorting: false,
		};

		return [ siteColumn ];
	}, [ onSelectSite, selectedSite?.id ] );

	const { data: allSites, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( availableSites as WooPaymentsSiteItem[], dataViewsState, fields );
	}, [ availableSites, dataViewsState, fields ] );

	return (
		<div className="redesigned-a8c-table search-enabled">
			{ isLoading ? (
				<A4ATablePlaceholder />
			) : (
				<ItemsDataViews
					data={ {
						items: allSites,
						fields,
						getItemId: ( item ) => `${ item.id }`,
						pagination: paginationInfo,
						enableSearch: true,
						actions: [],
						dataViewsState: dataViewsState,
						setDataViewsState: setDataViewsState,
						defaultLayouts: { table: {} },
					} }
				>
					<HStack className="dataviews__view-actions" justify="start">
						<DataViews.Search />
					</HStack>
					<DataViews.Layout />
					<DataViews.Footer />
				</ItemsDataViews>
			) }
		</div>
	);
};

export default AddWooPaymentsToSiteTable;
