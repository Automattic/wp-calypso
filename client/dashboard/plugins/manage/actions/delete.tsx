import {
	invalidatePlugins,
	invalidateSitePlugins,
	sitePluginAutoupdateDisableMutation,
	sitePluginDeactivateMutation,
	sitePluginRemoveMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { _n, sprintf } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const deleteAction: Action< PluginListRow > = {
	id: 'delete',
	label: ( items ) => {
		const [ plugin ] = items;
		const count = plugin.siteIds.length;

		return sprintf(
			// translators: %(count)d is the number of sites the plugin will be deleted on.
			_n( 'Delete on %(count)d site', 'Delete on %(count)d sites', count ),
			{ count: count }
		);
	},
	isPrimary: false,
	modalHeader: getModalHeader( 'delete' ),
	RenderModal: ( { items, closeModal } ) => {
		const { mutateAsync: deactivate } = useMutation( {
			...sitePluginDeactivateMutation(),
			onSuccess: () => {},
		} );
		const { mutateAsync: disableAutoupdate } = useMutation( {
			...sitePluginAutoupdateDisableMutation(),
			onSuccess: () => {},
		} );
		const { mutateAsync: remove } = useMutation( {
			...sitePluginRemoveMutation(),
			onSuccess: () => {},
		} );

		const action = async ( items: PluginListRow[] ) => {
			const bulkDeactivate = buildBulkSitesPluginAction( deactivate );
			const bulkDisableAutoupdate = buildBulkSitesPluginAction( disableAutoupdate );
			const bulkRemove = buildBulkSitesPluginAction( remove );

			// First deactivate all plugins
			await bulkDeactivate( items );
			// Then disable auto-updates
			await bulkDisableAutoupdate( items );
			// Finally remove the plugins
			const { successCount, errorCount } = await bulkRemove( items );

			return { successCount, errorCount };
		};

		return (
			<ActionRenderModal
				actionId="delete"
				items={ items }
				closeModal={ closeModal }
				onActionPerformed={ ( items: PluginListRow[] ) => {
					items
						.flatMap( ( item ) => item.siteIds )
						.forEach( ( siteId ) => {
							invalidateSitePlugins( siteId );
						} );

					invalidatePlugins();
				} }
				onExecute={ action }
			/>
		);
	},
	supportsBulk: true,
};
