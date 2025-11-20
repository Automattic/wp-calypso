import { Site } from '@automattic/api-core';
import { ExternalLink } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { getSiteDisplayUrl } from '../../utils/site-url';
import { usePlugin } from './use-plugin';
import type { Field } from '@wordpress/dataviews';

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

	const fields: Field< Site >[] = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Site' ),
				getValue: ( { item }: { item: Site } ) => getSiteDisplayUrl( item ),
				render: ( { field, item } ) => field.getValue( { item } ),
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
