import { Site } from '@automattic/api-core';
import { ExternalLink } from '@wordpress/components';
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

export const SitesWithoutThisPlugin = ( { pluginSlug }: { pluginSlug: string } ) => {
	const [ view, setView ] = useState< View >( defaultView );
	const { isLoading, sitesWithoutThisPlugin } = usePlugin( pluginSlug );

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
				render: () => (
					<ExternalLink href={ `https://wordpress.com/plugins/${ pluginSlug }` }>
						{ __( 'Go to plugin page' ) }
					</ExternalLink>
				),
			},
		],
		[ pluginSlug ]
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
