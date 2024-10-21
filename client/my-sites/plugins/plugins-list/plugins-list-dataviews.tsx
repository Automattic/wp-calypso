import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { Icon, link, linkOff, plugins, trash } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { find } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { navigate } from 'calypso/lib/navigate';
import { PluginActions } from '../hooks/types';

import './style.scss';

interface Props {
	currentPlugins: Array;
	initialSearch?: string;
	pluginsWithUpdates: Array;
	activePlugins: Array;
	inactivePlugins: Array;
	onSearch?: ( search: string ) => void;
	bulkActionDialog: ( action: string, plugins: Array ) => void;
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
	onSearch,
	bulkActionDialog,
}: Props ) {
	// Add flags for plugins status: active, inactive, updates
	// TODO: Check the best way of doind this. We can probably move this to the backend
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
				getValue: ( { item }: { item } ) => {
					return item.status;
				},
				render: () => null,
				elements: [
					{
						value: PLUGINS_STATUS.ACTIVE,
						label:
							translate( 'Active' ) +
							( activePlugins?.length > 0 ? ' - ' + activePlugins?.length : '' ),
					},
					{
						value: PLUGINS_STATUS.INACTIVE,
						label:
							translate( 'Inactive' ) +
							( inactivePlugins?.length > 0 ? ' - ' + inactivePlugins?.length : '' ),
					},
					{
						value: PLUGINS_STATUS.UPDATE,
						label:
							translate( 'Needs update' ) +
							( pluginsWithUpdates?.length > 0 ? ' - ' + pluginsWithUpdates?.length : '' ),
					},
				],
				filterBy: {
					operators: [ 'isAny' ],
					isPrimary: true,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				label: 'Installed Plugins',
				getValue: ( { item }: { item } ) => item.name,
				enableGlobalSearch: true,
				render: ( { item } ) => {
					return (
						<>
							{ item.icon && <img alt={ item.name } src={ item.icon } /> }
							{ ! item.icon && (
								<Icon
									size={ 32 }
									icon={ plugins }
									className="plugin-common-card__plugin-icon plugin-default-icon"
								/>
							) }
							<a href={ '/plugins/' + item.slug }>{ item.name }</a>
						</>
					);
				},
				enableSorting: false,
			},
			{
				id: 'sites',
				label: 'Sites',
				enableHiding: false,
				render: ( { item } ) => {
					return <span>{ item.sites && Object.keys( item.sites ).length }</span>;
				},
			},
			{
				id: 'update',
				label: 'Update available',
				enableHiding: false,
				render: ( { item } ) => {
					if ( item.status?.includes( PLUGINS_STATUS.UPDATE ) ) {
						return <Button variant="secondary">Update to 1.2.3</Button>;
					}
				},
			},
		],
		[]
	);

	const pluginsPerPage = 10;
	const initialDataViewsState = {
		type: 'table',
		search: initialSearch || '',
		filters: [],
		page: 1,
		perPage: pluginsPerPage,
		sort: {
			field: 'date',
			direction: 'desc',
		},
		fields: [ 'plugins', 'sites', 'update' ],
		layout: {},
	};

	const actions = [
		{
			href: `some-url`,
			callback: ( data ) => {
				data.length && navigate( '/plugins/' + data[ 0 ].slug );
			},
			label: translate( 'Manage Plugin' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: false,
		},
		{
			href: `some-url`,
			callback: ( plugins ) => {
				bulkActionDialog( PluginActions.ACTIVATE, plugins );
			},
			label: translate( 'Activate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
			icon: <Icon icon={ link } />,
		},
		{
			href: `some-url`,
			callback: ( plugins ) => {
				bulkActionDialog( PluginActions.DEACTIVATE, plugins );
			},
			label: translate( 'Deactivate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
			icon: <Icon icon={ linkOff } />,
		},
		{
			href: `some-url`,
			callback: ( plugins ) => {
				bulkActionDialog( PluginActions.ENABLE_AUTOUPDATES, plugins );
			},
			label: translate( 'Enable Autoupdate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			href: `some-url`,
			callback: ( plugins ) => {
				bulkActionDialog( PluginActions.DISABLE_AUTOUPDATES, plugins );
			},
			label: translate( 'Disable Autoupdate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			href: `some-url`,
			callback: ( plugins ) => {
				bulkActionDialog( PluginActions.REMOVE, plugins );
			},
			label: translate( 'Remove' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
			icon: <Icon icon={ trash } />,
		},
	];

	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

	// When search changes, notify the parent component
	useEffect( () => {
		onSearch && onSearch( dataViewsState.search );
	}, [ dataViewsState.search, onSearch ] );

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( currentPlugins, dataViewsState, fields );
	}, [ currentPlugins, dataViewsState, fields ] );

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
			/>
		</div>
	);
}
