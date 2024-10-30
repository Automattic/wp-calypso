import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { DataViews } from 'calypso/components/dataviews';
import { useSelector } from 'calypso/state';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { getPluginActionStatuses } from '../plugin-management-v2/utils/get-plugin-action-statuses';
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

export default function PluginsListDataViews( {
	currentPlugins,
	initialSearch,
	isLoading,
	onSearch,
	bulkActionDialog,
}: Props ) {
	const allStatuses = useSelector( getPluginActionStatuses );
	const translate = useTranslate();

	const fields = useFields( bulkActionDialog );
	const actions = useActions( bulkActionDialog );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( () => ( {
		...initialDataViewsState,
		perPage: 15,
		search: initialSearch,
		fields: [ 'plugins', 'sites', 'update' ],
	} ) );

	// When search changes, notify the parent component
	useEffect( () => {
		onSearch && onSearch( dataViewsState.search || '' );
	}, [ dataViewsState.search, onSearch ] );

	const { data, paginationInfo } = useMemo( () => {
		const result = filterSortAndPaginate( currentPlugins, dataViewsState, fields );

		// Add all statuses to the plugin object so we can display them in the DataViews
		result.data.forEach( ( plugin ) => {
			plugin.allStatuses = allStatuses.filter( ( status ) => status.pluginId === plugin.id );
		} );

		return {
			data: result.data,
			paginationInfo: result.paginationInfo,
		};
	}, [ currentPlugins, dataViewsState, fields, allStatuses ] );

	return (
		<DataViews
			data={ data }
			view={ dataViewsState }
			onChangeView={ setDataViewsState }
			fields={ fields }
			search
			searchLabel={ translate( 'Search for plugins' ) }
			actions={ actions }
			getItemId={ ( item ) => item.id }
			isLoading={ isLoading }
			paginationInfo={ paginationInfo }
			defaultLayouts={ { table: {} } }
		/>
	);
}
