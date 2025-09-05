import { Site } from '@automattic/api-core';
import { wpOrgPluginQuery, pluginsQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useLocale } from '../../app/locale';
import { pluginRoute } from '../../app/router/plugins';

const defaultView: View = {
	type: 'table',
	fields: [ 'activate', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

export const SitesWithThisPlugin = ( { sites }: { sites: Site[] } ) => {
	const [ view, setView ] = useState< View >( defaultView );
	const { pluginId } = pluginRoute.useParams();
	const locale = useLocale();
	const { data: sitesPlugins, isLoading: isLoadingSitesPlugins } = useQuery( pluginsQuery() );
	const { isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const { isLoading: isLoadingWpOrgPlugin } = useQuery( wpOrgPluginQuery( pluginId, locale ) );

	const fields = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Site' ),
				getValue: ( { item }: { item: Site } ) => item.URL,
				render: ( { item }: { item: Site } ) => item.URL,
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'active',
				label: __( 'Active' ),
				getValue: ( { item }: { item: Site } ) =>
					sitesPlugins?.sites[ item.ID ].find( ( p ) => p.slug === pluginId )?.active ?? false,
				render: ( { item }: { item: Site } ) =>
					sitesPlugins?.sites[ item.ID ].find( ( p ) => p.slug === pluginId )?.active ?? false,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'autoupdate',
				label: __( 'Autoupdate' ),
				getValue: ( { item }: { item: Site } ) =>
					sitesPlugins?.sites[ item.ID ].find( ( p ) => p.slug === pluginId )?.autoupdate ?? false,
				render: ( { item }: { item: Site } ) =>
					sitesPlugins?.sites[ item.ID ].find( ( p ) => p.slug === pluginId )?.autoupdate ?? false,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'update',
				label: __( 'Update' ),
				render: () => 'Update',
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ pluginId, sitesPlugins ]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	return (
		<DataViews
			isLoading={ isLoadingSitesPlugins || isLoadingSites || isLoadingWpOrgPlugin }
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ setView }
			defaultLayouts={ { table: {} } }
			actions={ [
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
			] }
			getItemId={ ( item ) => String( item.ID ) }
			paginationInfo={ paginationInfo }
		/>
	);
};
