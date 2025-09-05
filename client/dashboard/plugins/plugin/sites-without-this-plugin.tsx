import { Site } from '@automattic/api-core';
import { wpOrgPluginQuery, pluginsQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useLocale } from '../../app/locale';
import { pluginRoute } from '../../app/router/plugins';

const defaultView: View = {
	type: 'table',
	fields: [ 'link' ],
	layout: {
		styles: {
			link: { align: 'end' },
		},
	},
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

export const SitesWithoutThisPlugin = ( { sites }: { sites: Site[] } ) => {
	const [ view, setView ] = useState< View >( defaultView );
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
				header: <div />,
				getValue: ( { item }: { item: Site } ) => item.URL,
				render: ( { item }: { item: Site } ) => (
					<Link to={ `/plugins/${ pluginId }/${ item.slug }` }>{ __( 'Go to plugin page' ) }</Link>
				),
			},
		],
		[ pluginId ]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sites, view, fields );

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
		>
			<DataViews.Layout />
			<DataViews.Pagination />
		</DataViews>
	);
};
