import {
	invalidatePlugins,
	sitePluginActivateMutation,
	sitePluginDeactivateMutation,
	sitePluginUpdateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { check, close } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import ActionRenderModal, { getModalHeader } from '../manage/components/action-render-modal';
import { buildBulkSitesPluginAction } from '../manage/utils';
import { ActionRenderModalWrapper } from './components/action-render-modal-wrapper';
import { SiteWithPluginActivationStatus, usePlugin } from './use-plugin';
import { getAllowedPluginActions } from './utils/get-allowed-plugin-actions';
import { mapToPluginListRow } from './utils/map-to-plugin-list-row';
import type { PluginListRow } from '../manage/types';

const defaultView: View = {
	type: 'table',
	fields: [ 'active', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

export const SitesWithThisPlugin = ( { pluginSlug }: { pluginSlug: string } ) => {
	const { mutateAsync } = useMutation( sitePluginUpdateMutation() );
	const updateAction = buildBulkSitesPluginAction( mutateAsync );
	const { isLoading, plugin, pluginBySiteId, sitesWithThisPlugin } = usePlugin( pluginSlug );
	const [ view, setView ] = useState< View >( defaultView );
	const [ selection, setSelection ] = useState< SiteWithPluginActivationStatus[] >( [] );
	const [ updateModalOpen, setUpdateModalOpen ] = useState( false );
	const [ siteToUpdate, setSiteToUpdate ] = useState< SiteWithPluginActivationStatus | null >(
		null
	);
	const closeUpdateModal = () => {
		setUpdateModalOpen( false );
		setSiteToUpdate( null );
	};

	const fields = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Site' ),
				getValue: ( { item }: { item: SiteWithPluginActivationStatus } ) => item.URL,
				render: ( { item }: { item: SiteWithPluginActivationStatus } ) => item.URL,
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'active',
				label: __( 'Active' ),
				getValue: ( { item }: { item: SiteWithPluginActivationStatus } ) =>
					pluginBySiteId.get( item.ID )?.active ?? false,
				render: ( { item }: { item: SiteWithPluginActivationStatus } ) =>
					pluginBySiteId.get( item.ID )?.active ?? false,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'autoupdate',
				label: __( 'Autoupdate' ),
				getValue: ( { item }: { item: SiteWithPluginActivationStatus } ) =>
					pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				render: ( { item }: { item: SiteWithPluginActivationStatus } ) =>
					pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'update',
				label: __( 'Update' ),
				render: ( { item }: { item: SiteWithPluginActivationStatus } ) => {
					const update = pluginBySiteId.get( item.ID )?.update;

					const { autoupdate } = getAllowedPluginActions( item, pluginSlug );
					if ( ! autoupdate ) {
						return <Text>{ __( 'Auto-managed on this site' ) }</Text>;
					}

					if ( ! update ) {
						return null;
					}

					return (
						<Button
							variant="link"
							onClick={ ( e: React.MouseEvent ) => {
								e.preventDefault();
								setSiteToUpdate( item );
								setUpdateModalOpen( true );
							} }
							__next40pxDefaultSize
						>
							{ sprintf(
								// translators: %(version) is the new version of the plugin.
								__( 'Update to version %(version)s', update.new_version ),
								{ version: update.new_version }
							) }
						</Button>
					);
				},
				enableHiding: false,
			},
		],
		[ pluginBySiteId, pluginSlug ]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithThisPlugin, view, fields );

	return (
		<>
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
					setSelection(
						sitesWithThisPlugin.filter( ( site ) => ids.includes( String( site.ID ) ) )
					);
				} }
			/>

			<ActionRenderModalWrapper
				actionId="update"
				closeModal={ closeUpdateModal }
				isOpen={ updateModalOpen }
				items={ [
					mapToPluginListRow( plugin, siteToUpdate ? [ siteToUpdate ] : [] ) as PluginListRow,
				] }
				onExecute={ updateAction }
				onActionPerformed={ invalidatePlugins }
				onRequestClose={ closeUpdateModal }
				title={ __( 'Update Plugin' ) }
			/>
		</>
	);
};
