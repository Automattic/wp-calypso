import { Gridicon } from '@automattic/components';
import { isDesktop, subscribeIsDesktop } from '@automattic/viewport';
import { Button } from '@wordpress/components';
import { filterSortAndPaginate, Operator } from '@wordpress/dataviews';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import {
	DATAVIEWS_LIST,
	DATAVIEWS_TABLE,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { DataViews } from 'calypso/components/dataviews';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { THEME_STATUS } from '../../types';
import type { AggregatedTheme } from '../../types';
import type { SupportedLayouts } from '@wordpress/dataviews';

import './style.scss';

export default function ThemesList( {
	themes,
	isLoading,
	dataViewsState,
	setDataViewsState,
	onUpdateThemes,
	onSetAutoupdates,
	openThemeSitesPane,
	isThemeUpdating,
}: {
	themes: AggregatedTheme[];
	isLoading: boolean;
	dataViewsState: DataViewsState;
	setDataViewsState: React.Dispatch< React.SetStateAction< DataViewsState > >;
	onUpdateThemes: ( items: AggregatedTheme[] ) => void;
	onSetAutoupdates: ( items: AggregatedTheme[], autoupdate: boolean ) => void;
	openThemeSitesPane: ( theme: AggregatedTheme ) => void;
	isThemeUpdating: ( themeId: string ) => boolean;
} ) {
	const dispatch = useDispatch();
	const isPaneOpen = !! dataViewsState.selectedItem;
	const isDesktopView = isDesktop();
	const shouldUseListView = isPaneOpen || ! isDesktopView;

	// Match the plugins list: restrict layouts to the one in use, which also
	// removes the layout switcher option.
	const defaultLayouts: SupportedLayouts = shouldUseListView ? { list: {} } : { table: {} };

	const themeUpdateCount = themes.filter( ( theme ) => theme.pendingUpdates.length > 0 ).length;

	const [ isFilteringUpdates, setIsFilteringUpdates ] = useState( false );

	useEffect( () => {
		setDataViewsState( ( prevState ) => ( {
			...prevState,
			type: shouldUseListView ? DATAVIEWS_LIST : DATAVIEWS_TABLE,
		} ) );

		const unsubscribe = subscribeIsDesktop( ( matches ) => {
			setDataViewsState( ( prevState ) => ( {
				...prevState,
				type: isPaneOpen || ! matches ? DATAVIEWS_LIST : DATAVIEWS_TABLE,
			} ) );
		} );

		return () => unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isPaneOpen ] );

	useEffect( () => {
		if (
			dataViewsState.filters?.length === 1 &&
			dataViewsState.filters[ 0 ].field === 'status' &&
			dataViewsState.filters[ 0 ].value?.includes( THEME_STATUS.UPDATE )
		) {
			setIsFilteringUpdates( true );
		} else {
			setIsFilteringUpdates( false );
		}
	}, [ dataViewsState.filters ] );

	const fields = useMemo(
		() => [
			{
				id: 'status',
				label: __( 'Status' ),
				getValue: ( { item }: { item: AggregatedTheme } ) => item.status,
				render: () => null,
				elements: [
					{ value: THEME_STATUS.ACTIVE, label: __( 'Active' ) },
					{ value: THEME_STATUS.INACTIVE, label: __( 'Inactive' ) },
					{ value: THEME_STATUS.UPDATE, label: __( 'Update available' ) },
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
					isPrimary: false,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'icon',
				label: __( 'Screenshot' ),
				render: ( { item }: { item: AggregatedTheme } ) => {
					const size = shouldUseListView ? 52 : 35;
					return item.screenshot ? (
						<img
							className="themes-list__screenshot"
							style={ { width: size, height: size } }
							src={ item.screenshot }
							alt={ item.name }
						/>
					) : (
						<Gridicon className="themes-list__screenshot-fallback" icon="themes" size={ 36 } />
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'name',
				label: __( 'Installed themes' ),
				getValue: ( { item }: { item: AggregatedTheme } ) => item.name,
				enableGlobalSearch: true,
				render: ( { item }: { item: AggregatedTheme } ) => (
					<>
						<div className="themes-list__name-container">{ item.name }</div>
						{ isThemeUpdating( item.id ) && (
							<div className="themes-dashboard__updating">{ __( 'Updating…' ) }</div>
						) }
					</>
				),
				enableSorting: true,
			},
			{
				id: 'sites',
				label: __( 'Sites' ),
				enableHiding: false,
				getValue: ( { item }: { item: AggregatedTheme } ) => item.sites.length,
				render: ( { item }: { item: AggregatedTheme } ) => {
					const numberOfSites = item.sites.length;
					return (
						<Button
							className="themes-list__sites-button"
							onClick={ () => openThemeSitesPane( item ) }
						>
							{ shouldUseListView
								? sprintf(
										/* translators: %d is the number of sites the theme is installed on */
										_n( '%d site', '%d sites', numberOfSites ),
										numberOfSites
								  )
								: numberOfSites }
						</Button>
					);
				},
				enableSorting: true,
			},
			{
				id: 'update',
				label: __( 'Update available' ),
				getValue: ( { item }: { item: AggregatedTheme } ) =>
					item.pendingUpdates.length ? 'a' : 'b',
				enableHiding: false,
				enableSorting: true,
				render: ( { item }: { item: AggregatedTheme } ) => {
					if ( shouldUseListView ) {
						return null;
					}

					if ( isThemeUpdating( item.id ) ) {
						return <span className="themes-dashboard__updating">{ __( 'Updating…' ) }</span>;
					}

					if ( ! item.pendingUpdates.length ) {
						return __( 'No' );
					}

					return (
						<Button variant="secondary" onClick={ () => onUpdateThemes( [ item ] ) }>
							{ sprintf(
								/* translators: %s is the new theme version */
								__( 'Update to version %s' ),
								item.pendingUpdates[ 0 ].newVersion
							) }
						</Button>
					);
				},
			},
		],
		[ shouldUseListView, isThemeUpdating, onUpdateThemes, openThemeSitesPane ]
	);

	const actions = useMemo(
		() => [
			{
				id: 'update',
				label: __( 'Update to latest version' ),
				supportsBulk: true,
				isEligible: ( item: AggregatedTheme ) => item.pendingUpdates.length > 0,
				callback: ( items: AggregatedTheme[] ) => onUpdateThemes( items ),
			},
			{
				id: 'enable-autoupdates',
				label: __( 'Enable auto-updates' ),
				supportsBulk: true,
				callback: ( items: AggregatedTheme[] ) => onSetAutoupdates( items, true ),
			},
			{
				id: 'disable-autoupdates',
				label: __( 'Disable auto-updates' ),
				supportsBulk: true,
				callback: ( items: AggregatedTheme[] ) => onSetAutoupdates( items, false ),
			},
		],
		[ onUpdateThemes, onSetAutoupdates ]
	);

	const header = (
		<>
			{ themeUpdateCount > 0 && (
				<Button
					isPressed={ isFilteringUpdates }
					onClick={ () => {
						if ( isFilteringUpdates ) {
							setDataViewsState( ( prevState ) => ( {
								...prevState,
								filters: [],
								page: 1,
							} ) );
						} else {
							setDataViewsState( ( prevState ) => ( {
								...prevState,
								filters: [
									{
										field: 'status',
										operator: 'isAny',
										value: [ THEME_STATUS.UPDATE ],
									},
								],
								page: 1,
							} ) );
						}
						setIsFilteringUpdates( ! isFilteringUpdates );
						dispatch( recordTracksEvent( 'calypso_a4a_themes_list_pending_update_filter_click' ) );
					} }
				>
					{ sprintf(
						/* translators: %d is the number of themes with updates available */
						__( 'Update available (%d)' ),
						themeUpdateCount
					) }
				</Button>
			) }
		</>
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( themes, dataViewsState, fields );
	}, [ themes, dataViewsState, fields ] );

	return (
		<DataViews
			data={ data }
			view={ dataViewsState }
			onChangeView={ setDataViewsState }
			onChangeSelection={ ( selection: string[] ) => {
				if ( dataViewsState.type === DATAVIEWS_LIST ) {
					const theme = themes.find( ( item ) => item.id === selection[ 0 ] );
					if ( theme ) {
						openThemeSitesPane( theme );
					}
				}
			} }
			onClickItem={ ( item: AggregatedTheme ) => openThemeSitesPane( item ) }
			getItemId={ ( item: AggregatedTheme ) => item.id }
			fields={ fields }
			search
			searchLabel={ __( 'Search' ) }
			actions={ isPaneOpen ? [] : actions }
			isLoading={ isLoading }
			paginationInfo={ paginationInfo }
			defaultLayouts={ defaultLayouts }
			header={ header }
		/>
	);
}
