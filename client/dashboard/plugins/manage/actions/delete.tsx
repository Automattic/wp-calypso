import {
	invalidatePlugins,
	invalidateSitePlugins,
	sitePluginAutoupdateDisableMutation,
	sitePluginDeactivateMutation,
	sitePluginRemoveMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const deleteAction: Action< PluginListRow > = {
	id: 'delete',
	label: __( 'Delete' ),
	isPrimary: false,
	modalHeader: getModalHeader( 'delete' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
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

			items
				.flatMap( ( item ) => item.siteIds )
				.forEach( ( siteId ) => {
					invalidateSitePlugins( siteId );
				} );
			invalidatePlugins();

			return { successCount, errorCount };
		};

		return (
			<ActionRenderModal
				actionId="delete"
				items={ items }
				closeModal={ closeModal }
				onActionPerformed={ onActionPerformed }
				onExecute={ action }
			/>
		);
	},
};
