import {
	invalidatePlugins,
	sitePluginActivateMutation,
	sitePluginAutoupdateDisableMutation,
	sitePluginAutoupdateEnableMutation,
	sitePluginDeactivateMutation,
	sitePluginRemoveMutation,
	sitePluginUpdateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalText as Text, Button, Icon, ToggleControl } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { check, close, trash } from '@wordpress/icons';
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
	const { isLoading, plugin, pluginBySiteId, sitesWithThisPlugin, isFetching } =
		usePlugin( pluginSlug );
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
				render: ( { item }: { item: SiteWithPluginActivationStatus } ) => {
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
				getValue: ( { item }: { item: SiteWithPluginActivationStatus } ) =>
					pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				render: ( { item }: { item: SiteWithPluginActivationStatus } ) => {
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
						isEligible: ( item ) => {
							const { autoupdate } = getAllowedPluginActions( item, pluginSlug );

							return !! autoupdate && ! ( pluginBySiteId.get( item.ID )?.autoupdate ?? false );
						},
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

							return (
								<ActionRenderModal
									actionId="delete"
									items={ [ mapToPluginListRow( plugin, items ) as PluginListRow ] }
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
