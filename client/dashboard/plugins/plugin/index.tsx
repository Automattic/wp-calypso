import { Site } from '@automattic/api-core';
import { wpOrgPluginQuery, pluginsQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { partition } from 'lodash';
import { useMemo, useState } from 'react';
import { useLocale } from '../../app/locale';
import { pluginRoute } from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

const defaultSitesWithThisPluginView: View = {
	type: 'table',
	fields: [ 'activate', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

const SitesWithThisPlugin = ( { sitesWithThisPlugin }: { sitesWithThisPlugin: Site[] } ) => {
	const [ view, setView ] = useState( defaultSitesWithThisPluginView );
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
				id: 'activate',
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

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithThisPlugin, view, fields );

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

const defaultSitesWithoutThisPluginView: View = {
	type: 'table',
	fields: [ 'link' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

const SitesWithoutThisPlugin = ( {
	sitesWithoutThisPlugin,
}: {
	sitesWithoutThisPlugin: Site[];
} ) => {
	const [ view, setView ] = useState( defaultSitesWithoutThisPluginView );
	const { pluginId } = pluginRoute.useParams();
	const locale = useLocale();
	const { isLoading: isLoadingSitesPlugins } = useQuery( pluginsQuery() );
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
				id: 'link',
				label: null, // how to hide the header!?
				getValue: ( { item }: { item: Site } ) => item.URL,
				render: ( { item }: { item: Site } ) => (
					<Link to="/sites/">{ __( 'Go to plugin page' ) }</Link>
				),
			},
		],
		[]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithoutThisPlugin, view, fields );

	return (
		<DataViews
			search={ false }
			isLoading={ isLoadingSitesPlugins || isLoadingSites || isLoadingWpOrgPlugin }
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ setView }
			defaultLayouts={ { table: {} } }
			getItemId={ ( item ) => String( item.ID ) }
			paginationInfo={ paginationInfo }
		/>
	);
};

export default function Plugin() {
	const { pluginId } = pluginRoute.useParams();
	const locale = useLocale();
	const { data: sitesPlugins } = useQuery( pluginsQuery() );
	const { data: sites } = useQuery( sitesQuery() );
	const { data: wpOrgPlugin } = useQuery( wpOrgPluginQuery( pluginId, locale ) );

	const siteIdsWithThisPlugin = sitesPlugins?.sites
		? Object.entries( sitesPlugins.sites ).flatMap( ( [ siteId, plugins ] ) =>
				plugins.some( ( p ) => p.slug === pluginId ) ? [ siteId ] : []
		  )
		: [];

	const [ sitesWithThisPlugin, sitesWithoutThisPlugin ] = partition( sites, ( site ) =>
		siteIdsWithThisPlugin.includes( String( site.ID ) )
	);

	if ( ! wpOrgPlugin ) {
		return (
			<PageLayout size="large" header={ <PageHeader title={ __( 'Plugin Not Found' ) } /> }>
				<div>{ __( 'Plugin not found' ) }</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout size="large" header={ <PageHeader title={ wpOrgPlugin.name } /> }>
			<VStack spacing={ 4 } style={ { marginBottom: '24px' } }>
				<Text as="h2" weight={ 500 }>
					{ sprintf(
						// translators: %(count) is the number of sites the plugin is installed on.
						_n(
							'Installed on %(count)d site',
							'Installed on %(count)d sites',
							siteIdsWithThisPlugin.length
						),
						{ count: siteIdsWithThisPlugin.length }
					) }
				</Text>

				<DataViewsCard>
					<SitesWithThisPlugin sitesWithThisPlugin={ sitesWithThisPlugin } />
				</DataViewsCard>

				<Text as="h2" weight={ 500 }>
					{ __( 'Available on' ) }
				</Text>

				<DataViewsCard>
					<SitesWithoutThisPlugin sitesWithoutThisPlugin={ sitesWithoutThisPlugin } />
				</DataViewsCard>
			</VStack>
		</PageLayout>
	);
}
