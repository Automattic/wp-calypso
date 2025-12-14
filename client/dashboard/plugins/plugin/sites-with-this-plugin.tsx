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
import {
	DataViews,
	filterSortAndPaginate,
	View,
	type Field,
	type DataViewRenderFieldProps,
} from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { link, linkOff, trash } from '@wordpress/icons';
import { useCallback, useMemo, useState } from 'react';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import ActionRenderModal, { getModalHeader } from '../manage/components/action-render-modal';
import { PluginsHeaderActions } from '../manage/components/plugins-header-actions';
import { buildBulkSitesPluginAction } from '../manage/utils';
import { getViewFilteredByUpdates } from '../utils/update-filters';
import { ActionRenderModalWrapper } from './components/action-render-modal-wrapper';
import { ActiveToggle } from './components/active-toggle';
import { AutoupdateToggle } from './components/autoupdate-toggle';
import { PluginSiteFieldContent } from './components/plugin-site-field-content';
import { SiteWithPluginData } from './use-plugin';
import { getAllowedPluginActions } from './utils/get-allowed-plugin-actions';
import { mapToPluginListRow } from './utils/map-to-plugin-list-row';
import type { PluginListRow } from '../manage/types';
import type { PluginItem } from '@automattic/api-core';

const defaultView: View = {
	type: 'table',
	fields: [ 'active', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
	perPage: 10,
};

type SitesWithThisPluginProps = {
	pluginSlug: string;
	isLoading: boolean;
	plugin: PluginItem | undefined;
	pluginBySiteId: Map< number, PluginItem >;
	sitesWithThisPlugin: SiteWithPluginData[];
};

export const SitesWithThisPlugin = ( {
	pluginSlug,
	isLoading,
	plugin,
	pluginBySiteId,
	sitesWithThisPlugin,
}: SitesWithThisPluginProps ) => {
	const { mutateAsync } = useMutation( sitePluginUpdateMutation() );
	const updateAction = buildBulkSitesPluginAction( mutateAsync );
	const [ view, setView ] = useState< View >( defaultView );
	const { mutateAsync: activateMutate } = useMutation( sitePluginActivateMutation() );
	const { mutateAsync: deactivateMutate } = useMutation( sitePluginDeactivateMutation() );
	const { mutateAsync: enableAutoupdateMutate } = useMutation(
		sitePluginAutoupdateEnableMutation()
	);
	const { mutateAsync: disableAutoupdateMutate } = useMutation(
		sitePluginAutoupdateDisableMutation()
	);
	const [ selection, setSelection ] = useState< SiteWithPluginData[] >( [] );
	const [ updateModalOpen, setUpdateModalOpen ] = useState( false );
	const [ siteToUpdate, setSiteToUpdate ] = useState< SiteWithPluginData | null >( null );
	const [ optimisticActive, setOptimisticActive ] = useState<
		Record< number, boolean | undefined >
	>( {} );
	const [ optimisticAutoupdate, setOptimisticAutoupdate ] = useState<
		Record< number, boolean | undefined >
	>( {} );

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
				getValue: ( { item }: { item: SiteWithPluginData } ) => getSiteDisplayName( item ),
				render: ( { field, item } ) => (
					<PluginSiteFieldContent
						site={ item }
						name={ field.getValue( { item } ) as string }
						url={ getSiteDisplayUrl( item ) }
					/>
				),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'active',
				label: __( 'Active' ),
				type: 'boolean',
				getValue: ( { item }: { item: SiteWithPluginData } ) => {
					const pluginItem = pluginBySiteId.get( item.ID );
					const serverChecked = pluginItem?.active ?? false;
					const optimistic = optimisticActive[ item.ID ];

					// Use optimistic value if we have one, otherwise use server value
					return optimistic ?? serverChecked;
				},
				render: ( { field, item }: DataViewRenderFieldProps< SiteWithPluginData > ) => (
					<ActiveToggle
						item={ item }
						plugin={ plugin }
						active={ field.getValue?.( { item } ) as boolean }
						activateMutate={ activateMutate }
						deactivateMutate={ deactivateMutate }
						optimisticActive={ optimisticActive }
						setOptimisticActive={ setOptimisticActive }
					/>
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'autoupdate',
				label: __( 'Autoupdate' ),
				type: 'boolean',
				getValue: ( { item }: { item: SiteWithPluginData } ) => {
					const pluginItem = pluginBySiteId.get( item.ID );
					const checked = pluginItem?.autoupdate ?? false;
					const optimistic = optimisticAutoupdate[ item.ID ];
					return optimistic ?? checked;
				},
				render: ( { field, item }: DataViewRenderFieldProps< SiteWithPluginData > ) => {
					// Determine if this plugin is managed on this site; if so, disable interaction
					const { autoupdate } = getAllowedPluginActions( item, pluginSlug );
					// when not allowed, it's either managed or user lacks permission
					const isManaged = ! autoupdate;

					return (
						<AutoupdateToggle
							item={ item }
							plugin={ plugin }
							autoupdate={ field.getValue?.( { item } ) as boolean }
							enableAutoupdateMutate={ enableAutoupdateMutate }
							disableAutoupdateMutate={ disableAutoupdateMutate }
							optimisticAutoupdate={ optimisticAutoupdate }
							setOptimisticAutoupdate={ setOptimisticAutoupdate }
							disabled={ isManaged }
						/>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'update',
				label: __( 'Update' ),
				getValue: ( { item }: { item: SiteWithPluginData } ) => {
					const pluginItem = pluginBySiteId.get( item.ID );
					const { autoupdate, isManagedPlugin } = getAllowedPluginActions( item, pluginSlug );

					if ( isManagedPlugin ) {
						return 0;
					}

					return autoupdate && !! pluginItem?.update ? 2 : 1;
				},
				elements: [
					{ value: 2, label: __( 'Update available' ) },
					{ value: 1, label: __( 'Up to date' ) },
					{ value: 0, label: __( 'Auto-managed' ) },
				],
				render: ( { item }: { item: SiteWithPluginData } ) => {
					const update = pluginBySiteId.get( item.ID )?.update;
					const version = pluginBySiteId.get( item.ID )?.version;

					const { autoupdate } = getAllowedPluginActions( item, pluginSlug );
					if ( ! autoupdate ) {
						return <Text>{ __( 'Auto-managed' ) }</Text>;
					}

					if ( ! update && version ) {
						return (
							<Text>
								{ sprintf(
									// translators: %s is the version number of the plugin.
									__( '%s (current)' ),
									version
								) }
							</Text>
						);
					}

					if ( ! update?.new_version ) {
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
			optimisticActive,
			optimisticAutoupdate,
			plugin,
			activateMutate,
			deactivateMutate,
			pluginSlug,
			disableAutoupdateMutate,
			enableAutoupdateMutate,
			setOptimisticAutoupdate,
		]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithThisPlugin, view, fields );

	const updateCount = useMemo( () => {
		if ( ! sitesWithThisPlugin ) {
			return 0;
		}

		return sitesWithThisPlugin.filter( ( item ) => {
			const pluginItem = pluginBySiteId.get( item.ID );
			const { autoupdate } = getAllowedPluginActions( item, pluginSlug );

			return autoupdate && !! pluginItem?.update;
		} ).length;
	}, [ sitesWithThisPlugin, pluginBySiteId, pluginSlug ] );

	const handleFilterUpdates = useCallback( () => {
		if ( updateCount <= 0 ) {
			return;
		}

		setView( getViewFilteredByUpdates( view, 'update', 2 ) );
	}, [ updateCount, view, setView ] );

	return (
		<div className="sites-with-this-plugin">
			<DataViews
				isLoading={ isLoading }
				data={ data }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				header={
					<PluginsHeaderActions
						updateCount={ updateCount }
						onFilterUpdates={ handleFilterUpdates }
						isSitesWithThisPluginView
					/>
				}
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

							return !! autoupdate && ( pluginBySiteId.get( item.ID )?.autoupdate ?? false );
						},
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
		</div>
	);
};
