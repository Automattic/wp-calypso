import { Button } from '@wordpress/components';
import { filterSortAndPaginate, Operator } from '@wordpress/dataviews';
import { Icon, link, linkOff, plugins, trash } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { find } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { navigate } from 'calypso/lib/navigate';
import { useSelector } from 'calypso/state';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { PluginActions } from '../hooks/types';
import PluginActionStatus from '../plugin-management-v2/plugin-action-status';
import { getPluginActionStatuses } from '../plugin-management-v2/utils/get-plugin-action-statuses';

import './style.scss';

interface Props {
	currentPlugins: Array< Plugin >;
	initialSearch?: string;
	pluginsWithUpdates: Array< Plugin >;
	activePlugins: Array< Plugin >;
	inactivePlugins: Array< Plugin >;
	isLoading: boolean;
	onSearch?: ( search: string ) => void;
	bulkActionDialog: ( action: string, plugins: Array< Plugin > ) => void;
}

export const PLUGINS_STATUS = {
	ACTIVE: 1,
	INACTIVE: 2,
	UPDATE: 3,
};

export default function PluginsListDataViews( {
	currentPlugins,
	initialSearch,
	pluginsWithUpdates,
	activePlugins,
	inactivePlugins,
	isLoading,
	onSearch,
	bulkActionDialog,
}: Props ) {
	const allStatuses = useSelector( ( state ) => {
		return getPluginActionStatuses( state );
	} );

	// Add flags for plugins status: active, inactive, updates
	currentPlugins.map( ( plugin ) => {
		plugin.status = [];

		if ( find( pluginsWithUpdates, { slug: plugin.slug } ) ) {
			plugin.status.push( PLUGINS_STATUS.UPDATE );
		}

		if ( find( inactivePlugins, { slug: plugin.slug } ) ) {
			plugin.status.push( PLUGINS_STATUS.INACTIVE );
		}

		if ( find( activePlugins, { slug: plugin.slug } ) ) {
			plugin.status.push( PLUGINS_STATUS.ACTIVE );
		}

		return plugin;
	} );

	const translate = useTranslate();

	const fields = useMemo(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: ( { item }: { item: Plugin } ) => {
					return item.status;
				},
				render: () => null,
				elements: [
					{
						value: PLUGINS_STATUS.ACTIVE,
						label: translate( 'Active' ),
					},
					{
						value: PLUGINS_STATUS.INACTIVE,
						label: translate( 'Inactive' ),
					},
					{
						value: PLUGINS_STATUS.UPDATE,
						label: translate( 'Needs update' ),
					},
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
					isPrimary: true,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				label: translate( 'Installed Plugins' ),
				getValue: ( { item }: { item: Plugin } ) => item.name,
				enableGlobalSearch: true,
				render: ( { item }: { item: Plugin } ) => {
					let pluginActionStatus = null;

					if ( item.allStatuses?.length ) {
						pluginActionStatus = (
							<PluginActionStatus
								currentSiteStatuses={ item.allStatuses }
								selectedSite={ undefined }
							/>
						);
					}

					return (
						<>
							{ item.icon && <img className="plugin-icon" alt={ item.name } src={ item.icon } /> }
							{ ! item.icon && <Icon size={ 32 } icon={ plugins } className="plugin-icon" /> }
							<a href={ '/plugins/' + item.slug }>{ item.name }</a>
							{ pluginActionStatus }
						</>
					);
				},
				enableSorting: true,
			},
			{
				id: 'sites',
				label: translate( 'Sites' ),
				enableHiding: false,
				getValue: ( { item }: { item: Plugin } ) => {
					// Used exclusively for sorting
					return item.sites && Object.keys( item.sites ).length;
				},
				render: ( { item }: { item: Plugin } ) => {
					return <span>{ item.sites && Object.keys( item.sites ).length }</span>;
				},
			},
			{
				id: 'update',
				label: translate( 'Update available' ),
				getValue: ( { item }: { item: Plugin } ) => {
					// Used exclusively for sorting
					return item.status?.includes( PLUGINS_STATUS.UPDATE ) ? 'a' : 'b';
				},
				enableHiding: false,
				render: ( { item }: { item: Plugin } ) => {
					if ( item.status?.includes( PLUGINS_STATUS.UPDATE ) ) {
						return (
							<Button
								variant="secondary"
								onClick={ () => bulkActionDialog( PluginActions.UPDATE, [ item ] ) }
							>
								{ translate( 'Update to version %(version)s', {
									args: {
										version: item?.update?.new_version || '',
									},
								} ) }
							</Button>
						);
					}
				},
			},
		],
		[]
	);

	const actions = [
		{
			id: 'manage-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				plugins.length && navigate( '/plugins/' + plugins[ 0 ].slug );
			},
			label: translate( 'Manage Plugin' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: false,
		},
		{
			id: 'activate-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				bulkActionDialog( PluginActions.ACTIVATE, plugins );
			},
			label: translate( 'Activate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
			icon: <Icon icon={ link } />,
		},
		{
			id: 'deactivate-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				bulkActionDialog( PluginActions.DEACTIVATE, plugins );
			},
			label: translate( 'Deactivate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
			icon: <Icon icon={ linkOff } />,
		},
		{
			id: 'enable-autoupdate',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				bulkActionDialog( PluginActions.ENABLE_AUTOUPDATES, plugins );
			},
			label: translate( 'Enable Autoupdate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			id: 'disable-autoupdate',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				bulkActionDialog( PluginActions.DISABLE_AUTOUPDATES, plugins );
			},
			label: translate( 'Disable Autoupdate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			id: 'remove-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				bulkActionDialog( PluginActions.REMOVE, plugins );
			},
			label: translate( 'Remove' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
			icon: <Icon icon={ trash } />,
		},
	];

	// Set initial state for the data views
	const pluginsPerPage = 15;
	initialDataViewsState.perPage = pluginsPerPage;
	initialDataViewsState.search = initialSearch;
	initialDataViewsState.fields = [ 'plugins', 'sites', 'update' ];
	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

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
		<div className="referrals-details-table__container redesigned-a8c-table">
			<ItemsDataViews
				data={ {
					items: data,
					getItemId: ( item ) => `${ item.id }`,
					fields,
					pagination: paginationInfo,
					searchLabel: translate( 'Search for plugins' ),
					enableSearch: true,
					actions: actions,
					dataViewsState: dataViewsState,
					setDataViewsState: setDataViewsState,
					defaultLayouts: { table: {} },
				} }
				isLoading={ isLoading }
			/>
		</div>
	);
}
