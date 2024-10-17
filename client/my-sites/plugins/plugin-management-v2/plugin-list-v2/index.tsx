import { filterSortAndPaginate } from '@wordpress/dataviews';
import { Icon, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import Button from 'calypso/blocks/follow-button/button';

import './style.scss';

interface Props {
	currentPlugins: Array;
}

export default function PluginsListV2( { currentPlugins }: Props ) {
	const translate = useTranslate();

	console.log( 'currentPlugins', currentPlugins );

	const fields = useMemo(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				render: () => null,
				elements: [
					{ value: 1, label: translate( 'All' ) },
					{ value: 2, label: translate( 'Active' ) },
					{ value: 3, label: translate( 'Inactive' ) },
					{ value: 4, label: translate( 'Needs update' ) },
				],
				filterBy: {
					operators: [ 'is' ],
					isPrimary: true,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				label: 'Installed Plugins',
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
					return <Button>Update to 1.2.3</Button>;
				},
			},
		],
		[]
	);

	const pluginsPerPage = 10;
	const initialDataViewsState = {
		type: 'table',
		search: '',
		// filters:
		// 	filter?.issueTypes?.map( ( issueType ) => {
		// 		return {
		// 			field: 'status',
		// 			operator: 'is',
		// 			value: filtersMap.find( ( filterMap ) => filterMap.filterType === issueType )?.ref || 1,
		// 		};
		// 	} ) || [],
		filters: [
			// { field: 'plugins', operator: 'is', value: 2 },
			// { field: 'status', operator: 'isAny', value: [ 'publish', 'draft' ] },
		],
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

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( currentPlugins, dataViewsState, fields );
	}, [ currentPlugins, dataViewsState, fields ] );

	return (
		<div className="referrals-details-table__container redesigned-a8c-table">
			<ItemsDataViews
				data={ {
					items: data,
					fields,
					pagination: paginationInfo,
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
