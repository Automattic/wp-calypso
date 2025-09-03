import { pluginsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import type { PluginItem, PluginsResponse } from '@automattic/api-core';

export type PluginListRow = {
	id: string;
	name: string;
	sitesCount: number;
	updateAvailable: boolean;
};

const fields: Field< PluginListRow >[] = [
	{
		id: 'name',
		label: __( 'Plugin' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item } ) => item.name,
		render: ( { item, field } ) => field.getValue( { item } ),
	},
	{
		id: 'sitesCount',
		label: __( 'Sites' ),
		getValue: ( { item } ) => item.sitesCount,
		enableHiding: false,
		enableSorting: true,
		render: ( { item } ) => String( item.sitesCount ),
	},
	{
		id: 'updateAvailable',
		label: __( 'Update Available' ),
		getValue: ( { item } ) => ( item.updateAvailable ? 1 : 0 ),
		enableHiding: false,
		enableSorting: true,
		elements: [
			{ value: 1, label: __( 'Yes' ) },
			{ value: 0, label: __( 'No' ) },
		],
		render: ( { item } ) => ( item.updateAvailable ? __( 'Yes' ) : __( 'No' ) ),
	},
];

const defaultView: View = {
	type: 'table',
	fields: [ 'name', 'sitesCount', 'updateAvailable' ],
	sort: { field: 'name', direction: 'asc' },
};

function mapApiPluginsToDataViewPlugins( response?: PluginsResponse ): PluginListRow[] {
	if ( ! response?.sites ) {
		return [];
	}
	const sites = response.sites;
	const map = new Map< string, { name: string; count: number; updateAvailable: boolean } >();
	Object.values( sites ).forEach( ( plugins: PluginItem[] ) => {
		plugins.forEach( ( p ) => {
			if ( ! p.slug ) {
				return;
			}

			const entry = map.get( p.slug ) || {
				name: p.name || p.slug,
				count: 0,
				updateAvailable: false,
			};
			entry.count += 1;
			entry.name = p.name || entry.name;
			entry.updateAvailable = Boolean( p.update ) || entry.updateAvailable;
			map.set( p.slug, entry );
		} );
	} );
	return Array.from( map.entries() ).map( ( [ slug, { name, count, updateAvailable } ] ) => ( {
		id: slug,
		name,
		sitesCount: count,
		updateAvailable,
	} ) );
}

export default function PluginsList() {
	const actions: Array< Action< PluginListRow > > = [
		{
			id: 'delete',
			label: __( 'Delete' ),
			isPrimary: false,
			callback: ( items ) => {
				// Dummy delete action for now
				// eslint-disable-next-line no-console
				console.log( 'Delete clicked for plugin', items[ 0 ] );
			},
		},
	];
	const [ view, setView ] = useState( defaultView );
	const { data: sitesPlugins, isLoading } = useQuery( pluginsQuery() );
	const data = useMemo( () => mapApiPluginsToDataViewPlugins( sitesPlugins ), [ sitesPlugins ] );
	const { data: filteredPlugins, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, view, fields );
	}, [ data, view ] );

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Plugins' ) } /> }>
			<DataViewsCard>
				<DataViews
					isLoading={ isLoading }
					data={ filteredPlugins ?? [] }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					defaultLayouts={ { table: {} } }
					actions={ actions }
					getItemId={ ( item: PluginListRow ) => item.id }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
