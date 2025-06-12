import pagejs from '@automattic/calypso-router';
import { isDesktop, subscribeIsDesktop } from '@automattic/viewport';
import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	DATAVIEWS_LIST,
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import QueryDotorgPlugins from 'calypso/components/data/query-dotorg-plugins';
import { DataViews } from 'calypso/components/dataviews';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { useActions } from './use-actions';
import { useFields } from './use-fields';
import './style.scss';

interface Props {
	pluginSlug: string | null;
	currentPlugins: Array< Plugin >;
	initialSearch?: string;
	isLoading: boolean;
	onSearch?: ( search: string ) => void;
	bulkActionDialog: ( action: string, plugins: Array< Plugin > ) => void;
}

const defaultLayouts = { table: {} };

const openPluginSitesPane = ( plugin: Plugin ) => {
	recordTracksEvent( 'calypso_plugins_list_open_plugin_sites_pane', {
		plugin: plugin.slug,
	} );
	pagejs.show( `/plugins/manage/sites/${ plugin.slug }` );
};

export default function PluginsListDataViews( {
	pluginSlug,
	currentPlugins,
	initialSearch,
	isLoading,
	onSearch,
	bulkActionDialog,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isDesktopView = isDesktop();
	const shouldUseListView = pluginSlug !== undefined || ! isDesktopView;
	const pluginUpdateCount = currentPlugins.filter(
		( plugin ) => plugin.status?.includes( PLUGINS_STATUS.UPDATE )
	).length;

	const fields = useFields( bulkActionDialog, openPluginSitesPane, shouldUseListView );
	const actions = useActions( bulkActionDialog );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( () => {
		return {
			...initialDataViewsState,
			perPage: 15,
			search: initialSearch,
			fields: [ 'sites', 'update' ],
			type: shouldUseListView ? DATAVIEWS_LIST : DATAVIEWS_TABLE,
			titleField: 'plugins',
			mediaField: 'icon',
			layout: {
				styles: {
					plugins: {
						width: '60%',
						minWidth: '300px',
					},
					sites: {
						width: '70px',
					},
					update: {
						minWidth: '200px',
					},
					actions: {
						width: '50px',
					},
				},
			},
		};
	} );

	const [ isFilteringUpdates, setIsFilteringUpdates ] = useState( false );

	useEffect( () => {
		// Sets the correct fields when route changes or viewport changes
		setDataViewsState( {
			...dataViewsState,
			type: shouldUseListView ? DATAVIEWS_LIST : DATAVIEWS_TABLE,
		} );

		// Subscribe to viewport changes
		const unsubscribe = subscribeIsDesktop( ( matches ) => {
			const shouldUseListView = pluginSlug !== undefined || ! matches;
			setDataViewsState( {
				...dataViewsState,
				type: shouldUseListView ? DATAVIEWS_LIST : DATAVIEWS_TABLE,
			} );
		} );

		return () => unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ pluginSlug ] );

	const header = (
		<>
			{ pluginUpdateCount > 0 && (
				<Button
					isPressed={ isFilteringUpdates }
					onClick={ () => {
						if ( isFilteringUpdates ) {
							setDataViewsState( {
								...dataViewsState,
								filters: [],
								page: 1,
							} );
						} else {
							setDataViewsState( {
								...dataViewsState,
								filters: [
									{
										field: 'status',
										operator: 'isAny',
										value: [ PLUGINS_STATUS.UPDATE ],
									},
								],
								page: 1,
							} );
						}
						setIsFilteringUpdates( ! isFilteringUpdates );
						dispatch( recordTracksEvent( 'calypso_plugins_list_pending_update_filter_click' ) );
					} }
				>
					{ translate( 'Update available (%s)', { args: [ pluginUpdateCount ] } ) }
				</Button>
			) }
		</>
	);

	useEffect( () => {
		if ( dataViewsState.search !== initialSearch ) {
			onSearch && onSearch( dataViewsState.search || '' );
		}
	}, [ dataViewsState.search, onSearch, initialSearch ] );

	useEffect( () => {
		if (
			dataViewsState.filters?.length === 1 &&
			dataViewsState.filters[ 0 ].field === 'status' &&
			dataViewsState.filters[ 0 ].value?.includes( PLUGINS_STATUS.UPDATE )
		) {
			setIsFilteringUpdates( true );
		} else {
			setIsFilteringUpdates( false );
		}
	}, [ dataViewsState.filters ] );

	const { data, paginationInfo } = useMemo( () => {
		const result = filterSortAndPaginate( currentPlugins, dataViewsState, fields );

		return {
			data: result.data,
			paginationInfo: result.paginationInfo,
		};
	}, [ currentPlugins, dataViewsState, fields ] );

	const updatePluginOnChangeSelection = useCallback(
		( selection: string[] ) => {
			if ( dataViewsState.type === 'list' ) {
				const newPluginSelected = selection[ 0 ].split( '/' )[ 0 ];
				// @ts-expect-error The openPluginSitesPane function only requires a slug to work and we don't have a way to know the other required props.
				openPluginSitesPane( { slug: newPluginSelected } );
			}
		},
		[ dataViewsState.type ]
	);

	const trackPluginNameClick = useCallback(
		( item: Plugin ) => {
			dispatch(
				recordTracksEvent( 'calypso_plugins_manage_list_plugin_name_click', {
					plugin_slug: item.slug,
				} )
			);
		},
		[ dispatch ]
	);

	const onClickItem = useCallback(
		( item: Plugin ) => {
			trackPluginNameClick( item );
			openPluginSitesPane( item );
		},
		[ trackPluginNameClick ]
	);

	return (
		<>
			<QueryDotorgPlugins pluginSlugList={ data.map( ( plugin ) => plugin.slug ) } />
			<DataViews
				data={ data }
				view={ dataViewsState }
				onChangeView={ setDataViewsState }
				onChangeSelection={ updatePluginOnChangeSelection }
				onClickItem={ onClickItem }
				fields={ fields }
				search
				searchLabel={ translate( 'Search' ) }
				actions={ pluginSlug ? [] : actions }
				isLoading={ isLoading }
				paginationInfo={ paginationInfo }
				defaultLayouts={ defaultLayouts }
				header={ header }
			/>
		</>
	);
}
