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
import { __experimentalText as Text, Button, Icon } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View, type Field } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { link, linkOff, trash } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { getSiteDisplayUrl } from '../../utils/site-url';
import ActionRenderModal, { getModalHeader } from '../manage/components/action-render-modal';
import { buildBulkSitesPluginAction } from '../manage/utils';
import { ActionRenderModalWrapper } from './components/action-render-modal-wrapper';
import FieldActionToggle from './components/field-action-toggle';
import { SiteWithPluginData, usePlugin } from './use-plugin';
import { getAllowedPluginActions } from './utils/get-allowed-plugin-actions';
import { mapToPluginListRow } from './utils/map-to-plugin-list-row';
import type { PluginListRow } from '../manage/types';

const defaultView: View = {
	type: 'table',
	fields: [ 'active', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
	perPage: 10,
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
	const [ selection, setSelection ] = useState< SiteWithPluginData[] >( [] );
	const [ updateModalOpen, setUpdateModalOpen ] = useState( false );
	const [ siteToUpdate, setSiteToUpdate ] = useState< SiteWithPluginData | null >( null );
	const closeUpdateModal = () => {
		setUpdateModalOpen( false );
		setSiteToUpdate( null );
	};

	const fields: Field< SiteWithPluginData >[] = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Site' ),
				type: 'text',
				getValue: ( { item }: { item: SiteWithPluginData } ) => getSiteDisplayUrl( item ),
				render: ( { field, item } ) => field.getValue( { item } ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'active',
				label: __( 'Active' ),
				type: 'boolean',
				getValue: ( { item }: { item: SiteWithPluginData } ) =>
					pluginBySiteId.get( item.ID )?.active ?? false,
				render: ( { item }: { item: SiteWithPluginData } ) => {
					const pluginItem = pluginBySiteId.get( item.ID );
					const checked = pluginItem?.active ?? false;
					const isBusy = isActivating || isDeactivating || isFetching;
					return (
						<FieldActionToggle
							label={ __( 'Active' ) }
							checked={ checked }
							disabled={ isBusy }
							onToggle={ ( next ) => {
								if ( next ) {
									return activateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
								}
								return deactivateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
							} }
							successOn={ sprintf(
								// translators: %s is the name of the plugin.
								__( '%s has been activated.' ),
								plugin?.name ?? ''
							) }
							errorOn={ sprintf(
								// translators: %s is the name of the plugin.
								__( 'Failed to activate %s.' ),
								plugin?.name ?? ''
							) }
							successOff={ sprintf(
								// translators: %s is the name of the plugin.
								__( '%s has been deactivated.' ),
								plugin?.name ?? ''
							) }
							errorOff={ sprintf(
								// translators: %s is the name of the plugin.
								__( 'Failed to deactivate %s.' ),
								plugin?.name ?? ''
							) }
							actionId="activate"
						/>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'autoupdate',
				label: __( 'Autoupdate' ),
				type: 'boolean',
				getValue: ( { item }: { item: SiteWithPluginData } ) =>
					pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				render: ( { item }: { item: SiteWithPluginData } ) => {
					const pluginItem = pluginBySiteId.get( item.ID );
					const checked = pluginItem?.autoupdate ?? false;
					const isBusy = isEnablingAutoupdate || isDisablingAutoupdate || isFetching;

					// Determine if this plugin is managed on this site; if so, disable interaction
					const { autoupdate } = getAllowedPluginActions( item, pluginSlug );
					// when not allowed, it's either managed or user lacks permission
					const isManaged = ! autoupdate;

					return (
						<FieldActionToggle
							label={ __( 'Autoupdate' ) }
							checked={ checked }
							disabled={ isBusy || isManaged }
							onToggle={ ( next ) => {
								if ( next ) {
									return enableAutoupdateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
								}
								return disableAutoupdateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );
							} }
							successOn={ sprintf(
								// translators: %s is the name of the plugin.
								__( 'Auto‑updates for %s have been enabled.' ),
								plugin?.name ?? ''
							) }
							errorOn={ sprintf(
								// translators: %s is the name of the plugin.
								__( 'Failed to enable auto‑updates for %s.' ),
								plugin?.name ?? ''
							) }
							successOff={ sprintf(
								// translators: %s is the name of the plugin.
								__( 'Auto‑updates for %s have been disabled.' ),
								plugin?.name ?? ''
							) }
							errorOff={ sprintf(
								// translators: %s is the name of the plugin.
								__( 'Failed to disable auto‑updates for %s.' ),
								plugin?.name ?? ''
							) }
							actionId="autoupdate"
						/>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'update',
				label: __( 'Update' ),
				render: ( { item }: { item: SiteWithPluginData } ) => {
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
								// translators: %s is the new version of the plugin.
								__( 'Update to version %s' ),
								update.new_version
							) }
						</Button>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[
			pluginBySiteId,
			isActivating,
			isDeactivating,
			isFetching,
			plugin?.name,
			plugin?.id,
			deactivateMutate,
			activateMutate,
			isEnablingAutoupdate,
			isDisablingAutoupdate,
			pluginSlug,
			disableAutoupdateMutate,
			enableAutoupdateMutate,
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
						id: 'update',
						label: __( 'Update' ),
						modalHeader: getModalHeader( 'update' ),
						RenderModal: ( { items, closeModal } ) => {
							const { mutateAsync } = useMutation( sitePluginUpdateMutation() );
							const action = buildBulkSitesPluginAction( mutateAsync );

							return (
								<ActionRenderModal
									actionId="update"
									items={ [ mapToPluginListRow( plugin, items ) as PluginListRow ] }
									closeModal={ closeModal }
									onExecute={ action }
									onActionPerformed={ invalidatePlugins }
								/>
							);
						},
						isEligible: ( item ) => {
							const { autoupdate } = getAllowedPluginActions( item, pluginSlug );
							const pluginItem = pluginBySiteId.get( item.ID );
							return !! autoupdate && !! pluginItem?.update;
						},
						supportsBulk: true,
					},
					{
						id: 'activate',
						icon: link,
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
						icon: linkOff,
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
						isEligible: ( item ) => {
							const { autoupdate } = getAllowedPluginActions( item, pluginSlug );

							return !! autoupdate && ! ( pluginBySiteId.get( item.ID )?.autoupdate ?? false );
						},
						supportsBulk: true,
					},
					{
						id: 'settings',
						label: __( 'Settings' ),
						callback: ( items ) => {
							const [ site ] = items;
							window.open( site.actionLinks?.Settings, '_blank' );
						},
						isEligible: ( item ) => !! item.actionLinks?.Settings,
						supportsBulk: false,
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
						isEligible: ( item ) => {
							const { autoupdate } = getAllowedPluginActions( item, pluginSlug );

							return (
								!! autoupdate &&
								! ( pluginBySiteId.get( item.ID )?.autoupdate ?? false ) &&
								! item.isPluginActive
							);
						},
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
