import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import A4ATablePlaceholder from 'calypso/a8c-for-agencies/components/a4a-table-placeholder';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useFetchAllManagedSites } from 'calypso/a8c-for-agencies/sections/migrations/hooks/use-fetch-all-managed-sites';
import FormRadio from 'calypso/components/forms/form-radio';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { SelectSiteTableProps, A4ASelectSiteItem } from './types';

const A4ASelectSiteTable = ( { selectedSite, setSelectedSite }: SelectSiteTableProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { items, isLoading } = useFetchAllManagedSites();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site' ],
	} );

	const onSelectSite = useCallback(
		( item: A4ASelectSiteItem ) => {
			setSelectedSite( item );
			dispatch( recordTracksEvent( 'calypso_a4a_select_site_table_select_site_click' ) );
		},
		[ dispatch, setSelectedSite ]
	);

	const fields = useMemo( () => {
		const siteColumn = {
			id: 'site',
			label: translate( 'Site' ),
			getValue: ( { item }: { item: A4ASelectSiteItem } ) => item.site,
			render: ( { item }: { item: A4ASelectSiteItem } ) => (
				<div>
					<FormRadio
						htmlFor={ `site-${ item.id }` }
						id={ `site-${ item.id }` }
						checked={ selectedSite?.id === item.id }
						onChange={ () => onSelectSite( item ) }
						label={ item.site }
					/>
				</div>
			),
			enableGlobalSearch: true,
			enableHiding: false,
			enableSorting: false,
		};

		return [ siteColumn ];
	}, [ onSelectSite, selectedSite?.id, translate ] );

	const { data: allSites, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( items as A4ASelectSiteItem[], dataViewsState, fields );
	}, [ items, dataViewsState, fields ] );

	return (
		<div className="redesigned-a8c-table show-overflow-overlay search-enabled">
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
				/>
			) }
		</div>
	);
};

export default A4ASelectSiteTable;
