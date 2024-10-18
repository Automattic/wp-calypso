import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { Icon, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';

import './style.scss';

interface Props {
	currentPlugins: Array;
	initialSearch?: string;
	pluginUpdateCount: number;
	pluginActiveCount: number;
	pluginInactivecount: number;
	onSearch?: ( search: string ) => void;
}

export const PLUGINS_STATUS = {
	ACTIVE: 1,
	INACTIVE: 2,
	UPDATE: 3,
};

export default function PluginsListV2( {
	currentPlugins,
	initialSearch,
	pluginUpdateCount,
	pluginActiveCount,
	pluginInactivecount,
	onSearch,
}: Props ) {
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
							translate( 'Active' ) + ( pluginActiveCount > 0 ? ' - ' + pluginActiveCount : '' ),
					},
					{
						value: PLUGINS_STATUS.INACTIVE,
						label:
							translate( 'Inactive' ) +
							( pluginInactivecount > 0 ? ' - ' + pluginInactivecount : '' ),
					},
					{
						value: PLUGINS_STATUS.UPDATE,
						label:
							translate( 'Needs update' ) +
							( pluginUpdateCount > 0 ? ' - ' + pluginUpdateCount : '' ),
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
							{ item.icon && <img src={ item.icon } /> }
							{ ! item.icon && (
								<Icon
									size={ 32 }
									icon={ plugins }
									className="plugin-common-card__plugin-icon plugin-default-icon"
								/>
							) }
							<a href="...">{ item.name }</a>
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
					if ( item.status.includes( PLUGINS_STATUS.UPDATE ) ) {
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
			callback: () => {
				console.log( 'Manage Plugin' );
			},
			label: translate( 'Manage Plugin' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: false,
		},
		{
			href: `some-url`,
			callback: () => {
				console.log( 'Activate' );
			},
			label: translate( 'Activate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			href: `some-url`,
			callback: () => {
				console.log( 'Deactivate' );
			},
			label: translate( 'Deactivate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			href: `some-url`,
			callback: () => {
				console.log( 'Enable Autoupdate' );
			},
			label: translate( 'Enable Autoupdate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			href: `some-url`,
			callback: () => {
				console.log( 'Disable Autoupdate' );
			},
			label: translate( 'Disable Autoupdate' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
		},
		{
			href: `some-url`,
			callback: () => {
				console.log( 'Remove' );
			},
			label: translate( 'Remove' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
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
