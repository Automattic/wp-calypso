import {
	invalidatePlugins,
	invalidateSitePlugins,
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
		const { mutateAsync } = useMutation( {
			...sitePluginRemoveMutation(),
			onSuccess: () => {},
		} );
		const action = buildBulkSitesPluginAction( mutateAsync );

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
	isEligible: ( item: PluginListRow ) => {
		return item.isActive === 'none';
	},
};
