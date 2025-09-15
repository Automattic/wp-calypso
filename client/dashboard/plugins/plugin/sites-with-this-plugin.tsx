import { Site } from '@automattic/api-core';
import {
	invalidatePlugins,
	sitePluginActivateMutation,
	sitePluginDeactivateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { check, close } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import ActionRenderModal, { getModalHeader } from '../manage/components/action-render-modal';
import { buildBulkSitesPluginAction } from '../manage/utils';
import { SiteWithPluginActivationStatus, usePlugin } from './use-plugin';
import type { PluginListRow } from '../manage/types';

const defaultView: View = {
	type: 'table',
	fields: [ 'active', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

const mapToPluginListRow = (
	plugin: ReturnType< typeof usePlugin >[ 'plugin' ],
	items: SiteWithPluginActivationStatus[]
): Partial< PluginListRow > => {
	return {
		id: plugin?.id,
		slug: plugin?.slug,
		name: plugin?.name,
		siteIds: items.map( ( item ) => item.ID ),
		sitesCount: items.length,
	};
};

export const SitesWithThisPlugin = ( { pluginSlug }: { pluginSlug: string } ) => {
	const [ view, setView ] = useState< View >( defaultView );
	const { isLoading, plugin, pluginBySiteId, sitesWithThisPlugin } = usePlugin( pluginSlug );
	const [ selection, setSelection ] = useState< SiteWithPluginActivationStatus[] >( [] );

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
					id: 'activate',
					icon: check,
					label: __( 'Activate' ),
					modalHeader: getModalHeader( 'activate' ),
					RenderModal: ( { items, closeModal } ) => {
						const { mutateAsync } = useMutation( sitePluginActivateMutation() );
						const action = buildBulkSitesPluginAction( mutateAsync );

						return (
							<ActionRenderModal
								actionId="activate"
								items={ [ mapToPluginListRow( plugin, items ) as PluginListRow ] }
								closeModal={ closeModal }
								onExecute={ action }
								onActionPerformed={ invalidatePlugins }
							/>
						);
					},
					isEligible: ( item ) => ! item.isPluginActive,
					supportsBulk: true,
				},
				{
					id: 'deactivate',
					icon: close,
					label: __( 'Deactivate' ),
					modalHeader: getModalHeader( 'deactivate' ),
					RenderModal: ( { items, closeModal } ) => {
						const { mutateAsync } = useMutation( sitePluginDeactivateMutation() );
						const action = buildBulkSitesPluginAction( mutateAsync );

						return (
							<ActionRenderModal
								actionId="deactivate"
								items={ [ mapToPluginListRow( plugin, items ) as PluginListRow ] }
								closeModal={ closeModal }
								onExecute={ action }
								onActionPerformed={ invalidatePlugins }
							/>
						);
					},
					isEligible: ( item ) => item.isPluginActive,
					supportsBulk: true,
				},
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
			selection={ selection.map( ( site ) => String( site.ID ) ) }
			onChangeSelection={ ( ids ) => {
				setSelection( sitesWithThisPlugin.filter( ( site ) => ids.includes( String( site.ID ) ) ) );
			} }
		/>
	);
};
