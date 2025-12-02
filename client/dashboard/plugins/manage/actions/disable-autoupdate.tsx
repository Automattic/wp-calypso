import {
	invalidatePlugins,
	invalidateSitePlugins,
	sitePluginAutoupdateDisableMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { _n, sprintf } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const disableAutoupdateAction: Action< PluginListRow > = {
	id: 'disable-autoupdate',
	label: ( items ) => {
		const [ plugin ] = items;
		const enabledCount = plugin.sitesWithPluginAutoupdated.length;

		return sprintf(
			// translators: %(count)d is the number of sites the plugin will have auto-updates disabled on.
			_n(
				'Disable auto‑updates on %(count)d site',
				'Disable auto‑updates on %(count)d sites',
				enabledCount
			),
			{ count: enabledCount }
		);
	},
	modalHeader: getModalHeader( 'disable-autoupdate' ),
	RenderModal: ( { items, closeModal } ) => {
		const { mutateAsync } = useMutation( {
			...sitePluginAutoupdateDisableMutation(),
			onSuccess: () => {},
		} );
		const action = buildBulkSitesPluginAction( mutateAsync );

		return (
			<ActionRenderModal
				actionId="disable-autoupdate"
				items={ items.map( ( item ) => ( {
					...item,
					siteIds: item.siteIds.filter( ( siteId ) =>
						item.sitesWithPluginAutoupdated.includes( siteId )
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
		return ! item.isManaged && [ 'some', 'all' ].includes( item.areAutoUpdatesEnabled );
	},
};
