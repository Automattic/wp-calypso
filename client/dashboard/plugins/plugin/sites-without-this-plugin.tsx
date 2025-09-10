import { Site } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { usePlugin } from './use-plugin';

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

export const SitesWithoutThisPlugin = ( { pluginId }: { pluginId: string } ) => {
	const [ view, setView ] = useState< View >( defaultView );
	const { isLoading, sitesWithoutThisPlugin } = usePlugin( pluginId );

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

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithoutThisPlugin, view, fields );

	return (
		<DataViews
			search={ false }
			isLoading={ isLoading }
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
