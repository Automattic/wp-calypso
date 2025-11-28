import {
	invalidatePlugins,
	invalidateSitePlugins,
	sitePluginDeactivateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { _n, sprintf } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const deactivateAction: Action< PluginListRow > = {
	id: 'deactivate',
	label: ( items ) => {
		const [ plugin ] = items;
		const activeCount = plugin.sitesWithPluginActive.length;

		return sprintf(
			// translators: %(count)d is the number of sites the plugin will be deactivated on.
			_n( 'Deactivate on %(count)d site', 'Deactivate on %(count)d sites', activeCount ),
			{ count: activeCount }
		);
	},
	modalHeader: getModalHeader( 'deactivate' ),
	RenderModal: ( { items, closeModal } ) => {
		const { mutateAsync } = useMutation( {
			...sitePluginDeactivateMutation(),
			onSuccess: () => {},
		} );
		const action = async ( items: PluginListRow[] ) => {
			const bulkDeactivate = buildBulkSitesPluginAction( mutateAsync );

			const { successCount, errorCount } = await bulkDeactivate( items );

			return { successCount, errorCount };
		};

		return (
			<ActionRenderModal
				actionId="deactivate"
				items={ items.map( ( item ) => ( {
					...item,
					siteIds: item.siteIds.filter( ( siteId ) =>
						item.sitesWithPluginActive.includes( siteId )
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
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'all' ].includes( item.isActive );
	},
};
