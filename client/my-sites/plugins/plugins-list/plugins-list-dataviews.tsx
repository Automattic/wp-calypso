import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import QueryDotorgPlugins from 'calypso/components/data/query-dotorg-plugins';
import { DataViews } from 'calypso/components/dataviews';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { useActions } from './use-actions';
import { useFields } from './use-fields';

import './style.scss';

interface Props {
	currentPlugins: Array< Plugin >;
	initialSearch?: string;
	isLoading: boolean;
	onSearch?: ( search: string ) => void;
	bulkActionDialog: ( action: string, plugins: Array< Plugin > ) => void;
}

const defaultLayouts = { table: {} };

export default function PluginsListDataViews( {
	currentPlugins,
	initialSearch,
	isLoading,
	onSearch,
	bulkActionDialog,
}: Props ) {
	const translate = useTranslate();
	const pluginUpdateCount = currentPlugins.filter(
		( plugin ) => plugin.status?.includes( PLUGINS_STATUS.UPDATE )
	).length;
	const fields = useFields( bulkActionDialog );
	const actions = useActions( bulkActionDialog );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( () => ( {
		...initialDataViewsState,
		perPage: 15,
		search: initialSearch,
		fields: [ 'plugins', 'sites', 'update' ],
	} ) );

	const [ isFilteringUpdates, setIsFilteringUpdates ] = useState( false );

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
					} }
				>
					{ translate( 'Pending update (%s)', { args: [ pluginUpdateCount ] } ) }
				</Button>
			) }
		</>
	);

	// When search changes, notify the parent component
	useEffect( () => {
		if ( dataViewsState.search !== initialSearch ) {
			onSearch && onSearch( dataViewsState.search || '' );
		}
	}, [ dataViewsState.search, onSearch, initialSearch ] );

	useEffect( () => {
		if (
			dataViewsState.filters?.length === 1 &&
			dataViewsState.filters[ 0 ].field === 'status' &&
			dataViewsState.filters[ 0 ].value.includes( PLUGINS_STATUS.UPDATE )
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

	return (
		<>
			<QueryDotorgPlugins pluginSlugList={ data.map( ( plugin ) => plugin.slug ) } />
			<DataViews
				data={ data }
				view={ dataViewsState }
				onChangeView={ setDataViewsState }
				fields={ fields }
				search
				searchLabel={ translate( 'Search for plugins' ) }
				actions={ actions }
				isLoading={ isLoading }
				paginationInfo={ paginationInfo }
				defaultLayouts={ defaultLayouts }
				header={ header }
			/>
		</>
	);
}
