import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { CheckboxControl } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import A4ATablePlaceholder from 'calypso/a8c-for-agencies/components/a4a-table-placeholder';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useFetchAllManagedSites } from '../hooks/use-fetch-all-managed-sites';
import { TaggedSite } from '../types';

export type SiteItem = {
	id: number;
	site: string;
	date: string;
};

export default function MigrationsAddSitesTable( {
	selectedSites,
	setSelectedSites,
	taggedSites,
}: {
	selectedSites: SiteItem[];
	setSelectedSites: ( sites: SiteItem[] ) => void;
	taggedSites?: TaggedSite[];
} ) {
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();
	const dispatch = useDispatch();

	const { items, isLoading } = useFetchAllManagedSites();

	const taggedSitesIds = useMemo(
		() => taggedSites?.map( ( site ) => site.id ) || [],
		[ taggedSites ]
	);

	// Filter out sites that are already tagged
	const availableSites = useMemo( () => {
		return items.filter( ( item ) => ! taggedSitesIds.includes( item.id ) );
	}, [ items, taggedSitesIds ] );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site', 'date' ],
	} );

	const onSelectAllSites = useCallback( () => {
		const isAllSitesSelected = selectedSites.length === availableSites.length;
		setSelectedSites( isAllSitesSelected ? [] : availableSites );
		dispatch(
			recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_select_all_sites_click', {
				type: isAllSitesSelected ? 'deselect' : 'select',
			} )
		);
	}, [ dispatch, availableSites, selectedSites.length, setSelectedSites ] );

	const onSelectSite = useCallback(
		( checked: boolean, item: SiteItem ) => {
			if ( checked ) {
				setSelectedSites( [ ...selectedSites, item ] );
			} else {
				setSelectedSites( selectedSites.filter( ( site ) => site.id !== item.id ) );
			}
			dispatch(
				recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_select_site_click', {
					type: checked ? 'select' : 'deselect',
				} )
			);
		},
		[ dispatch, selectedSites, setSelectedSites ]
	);

	const fields = useMemo( () => {
		const siteColumn = {
			id: 'site',
			label: (
				<div>
					<CheckboxControl
						label={ translate( 'Site' ).toUpperCase() }
						checked={ selectedSites.length === availableSites.length }
						onChange={ onSelectAllSites }
						disabled={ false }
					/>
				</div>
			 ) as any,
			getValue: () => '-',
			render: ( { item }: { item: SiteItem } ) => (
				<CheckboxControl
					className="view-details-button"
					data-site-id={ item.id }
					label={ item.site }
					checked={ selectedSites.map( ( site ) => site.id ).includes( item.id ) }
					onChange={ ( checked ) => onSelectSite( checked, item ) }
					disabled={ false }
				/>
			),
			enableHiding: false,
			enableSorting: false,
		};

		const dateColumn = {
			id: 'date',
			label: translate( 'Date Added' ).toUpperCase(),
			getValue: () => '-',
			render: ( { item }: { item: SiteItem } ) => new Date( item.date ).toLocaleDateString(),
			enableHiding: false,
			enableSorting: false,
		};

		return isDesktop ? [ siteColumn, dateColumn ] : [ siteColumn ];
	}, [
		isDesktop,
		availableSites.length,
		onSelectAllSites,
		onSelectSite,
		selectedSites,
		translate,
	] );

	const { data: allSites, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( availableSites, dataViewsState, fields );
	}, [ availableSites, dataViewsState, fields ] );

	return (
		<div className="add-sites-table redesigned-a8c-table">
			{ isLoading ? (
				<A4ATablePlaceholder />
			) : (
				<ItemsDataViews
					data={ {
						items: allSites,
						fields,
						getItemId: ( item ) => `${ item.id }`,
						pagination: paginationInfo,
						enableSearch: false,
						actions: [],
						dataViewsState: dataViewsState,
						setDataViewsState: setDataViewsState,
						defaultLayouts: { table: {} },
					} }
				/>
			) }
		</div>
	);
}
