import { Site } from '@automattic/api-core';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { usePlugin } from './use-plugin';

const defaultView: View = {
	type: 'table',
	fields: [ 'active', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

export const SitesWithThisPlugin = ( { pluginId }: { pluginId: string } ) => {
	const [ view, setView ] = useState< View >( defaultView );
	const { isLoading, pluginBySiteId, sitesWithThisPlugin } = usePlugin( pluginId );

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
				getValue: ( { item }: { item: Site } ) => pluginBySiteId.get( item.ID )?.active ?? false,
				render: ( { item }: { item: Site } ) => pluginBySiteId.get( item.ID )?.active ?? false,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'autoupdate',
				label: __( 'Autoupdate' ),
				getValue: ( { item }: { item: Site } ) =>
					pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				render: ( { item }: { item: Site } ) => pluginBySiteId.get( item.ID )?.autoupdate ?? false,
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
		[ pluginBySiteId ]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithThisPlugin, view, fields );

	return (
		<DataViews
			isLoading={ isLoading }
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
