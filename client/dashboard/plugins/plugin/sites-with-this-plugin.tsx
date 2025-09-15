import { Site } from '@automattic/api-core';
import {
	invalidatePlugins,
	sitePluginActivateMutation,
	sitePluginDeactivateMutation,
	sitePluginRemoveMutation,
	sitePluginAutoupdateEnableMutation,
	sitePluginAutoupdateDisableMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Icon, ToggleControl } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { check, close, trash } from '@wordpress/icons';
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
	const { mutateAsync: activateMutate, isPending: isActivating } = useMutation(
		sitePluginActivateMutation()
	);
	const { mutateAsync: deactivateMutate, isPending: isDeactivating } = useMutation(
		sitePluginDeactivateMutation()
	);
	const { mutateAsync: enableAutoupdateMutate, isPending: isEnablingAutoupdate } = useMutation(
		sitePluginAutoupdateEnableMutation()
	);
	const { mutateAsync: disableAutoupdateMutate, isPending: isDisablingAutoupdate } = useMutation(
		sitePluginAutoupdateDisableMutation()
	);
	const { isLoading, plugin, pluginBySiteId, sitesWithThisPlugin, isFetching } =
		usePlugin( pluginSlug );
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
				render: ( { item }: { item: Site } ) => {
					const pluginItem = pluginBySiteId.get( item.ID );
					const checked = pluginItem?.active ?? false;
					const isBusy = isActivating || isDeactivating || isFetching;
					return (
						<ToggleControl
							label={ __( 'Active' ) }
							checked={ checked }
							onClick={ ( e ) => e.preventDefault() }
							onChange={ ( next ) => {
								if ( next ) {
									activateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
								} else {
									deactivateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
								}
							} }
							disabled={ isBusy }
						/>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'autoupdate',
				label: __( 'Autoupdate' ),
				getValue: ( { item }: { item: Site } ) =>
					pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				render: ( { item }: { item: Site } ) => {
					const pluginItem = pluginBySiteId.get( item.ID );
					const checked = pluginItem?.autoupdate ?? false;
					const isBusy = isEnablingAutoupdate || isDisablingAutoupdate || isFetching;
					return (
						<ToggleControl
							label={ __( 'Autoupdate' ) }
							checked={ checked }
							onClick={ ( e ) => e.preventDefault() }
							onChange={ ( next ) => {
								if ( next ) {
									enableAutoupdateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
								} else {
									disableAutoupdateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
								}
							} }
							disabled={ isBusy }
						/>
					);
				},
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
		[
			isFetching,
			pluginBySiteId,
			isActivating,
			isDeactivating,
			isEnablingAutoupdate,
			isDisablingAutoupdate,
			activateMutate,
			deactivateMutate,
			enableAutoupdateMutate,
			disableAutoupdateMutate,
			plugin?.id,
		]
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
					id: 'enable-autoupdate',
					label: __( 'Enable auto‑updates' ),
					modalHeader: getModalHeader( 'enable-autoupdate' ),
					RenderModal: ( { items, closeModal } ) => {
						const { mutateAsync } = useMutation( sitePluginAutoupdateEnableMutation() );
						const action = buildBulkSitesPluginAction( mutateAsync );
						return (
							<ActionRenderModal
								actionId="enable-autoupdate"
								items={ [ mapToPluginListRow( plugin, items ) as PluginListRow ] }
								closeModal={ closeModal }
								onExecute={ action }
								onActionPerformed={ invalidatePlugins }
							/>
						);
					},
					isEligible: ( item ) => ! ( pluginBySiteId.get( item.ID )?.autoupdate ?? false ),
					supportsBulk: true,
				},
				{
					id: 'disable-autoupdate',
					label: __( 'Disable auto‑updates' ),
					modalHeader: getModalHeader( 'disable-autoupdate' ),
					RenderModal: ( { items, closeModal } ) => {
						const { mutateAsync } = useMutation( sitePluginAutoupdateDisableMutation() );
						const action = buildBulkSitesPluginAction( mutateAsync );
						return (
							<ActionRenderModal
								actionId="disable-autoupdate"
								items={ [ mapToPluginListRow( plugin, items ) as PluginListRow ] }
								closeModal={ closeModal }
								onExecute={ action }
								onActionPerformed={ invalidatePlugins }
							/>
						);
					},
					isEligible: ( item ) => pluginBySiteId.get( item.ID )?.autoupdate ?? false,
					supportsBulk: true,
				},
				{
					id: 'delete',
					label: __( 'Delete' ),
					modalHeader: getModalHeader( 'delete' ),
					RenderModal: ( { items, closeModal } ) => {
						const { mutateAsync } = useMutation( sitePluginRemoveMutation() );
						const action = buildBulkSitesPluginAction( mutateAsync );
						const siteIds = items.map( ( site ) => site.ID );

						return (
							<ActionRenderModal
								actionId="delete"
								items={ [ { ...plugin, siteIds, sitesCount: items.length } as PluginListRow ] }
								closeModal={ closeModal }
								onExecute={ action }
							/>
						);
					},
					isEligible: ( item ) => ! item.isPluginActive,
					supportsBulk: true,
					icon: <Icon icon={ trash } />,
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
