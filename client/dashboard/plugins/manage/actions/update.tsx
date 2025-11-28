import {
	invalidatePlugins,
	invalidateSitePlugins,
	sitePluginUpdateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { _n, sprintf } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const updateAction: Action< PluginListRow > = {
	id: 'update',
	label: ( items ) => {
		const [ plugin ] = items;
		const updatedCount = plugin.sitesWithPluginUpdate.length;

		return sprintf(
			// translators: %(count)d is the number of sites the plugin will be updated on.
			_n( 'Update on %(count)d site', 'Update on %(count)d sites', updatedCount ),
			{ count: updatedCount }
		);
	},
	modalHeader: getModalHeader( 'update' ),
	RenderModal: ( { items, closeModal } ) => {
		const { mutateAsync } = useMutation( {
			...sitePluginUpdateMutation(),
			onSuccess: () => {},
		} );
		const action = buildBulkSitesPluginAction( mutateAsync );

		return (
			<ActionRenderModal
				actionId="update"
				items={ items.map( ( item ) => ( {
					...item,
					siteIds: item.siteIds.filter( ( siteId ) =>
						item.sitesWithPluginUpdate.includes( siteId )
					),
				} ) ) }
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
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'all' ].includes( item.hasUpdate );
	},
};
