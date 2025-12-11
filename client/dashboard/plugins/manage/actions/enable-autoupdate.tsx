import {
	invalidatePlugins,
	invalidateSitePlugins,
	sitePluginAutoupdateEnableMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { _n, sprintf } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const enableAutoupdateAction: Action< PluginListRow > = {
	id: 'enable-autoupdate',
	label: ( items ) => {
		const [ plugin ] = items;
		const disabledCount = plugin.sitesWithPluginNotAutoupdated.length;

		return sprintf(
			// translators: %(count)d is the number of sites the plugin will have auto-updates enabled on.
			_n(
				'Enable auto‑updates on %(count)d site',
				'Enable auto‑updates on %(count)d sites',
				disabledCount
			),
			{ count: disabledCount }
		);
	},
	modalHeader: getModalHeader( 'enable-autoupdate' ),
	RenderModal: ( { items, closeModal } ) => {
		const { mutateAsync } = useMutation( {
			...sitePluginAutoupdateEnableMutation(),
			onSuccess: () => {},
		} );
		const action = buildBulkSitesPluginAction( mutateAsync );

		return (
			<ActionRenderModal
				actionId="enable-autoupdate"
				items={ items.map( ( item ) => ( {
					...item,
					siteIds: item.siteIds.filter( ( siteId ) =>
						item.sitesWithPluginNotAutoupdated.includes( siteId )
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
		return ! item.isManaged && [ 'some', 'none' ].includes( item.areAutoUpdatesEnabled );
	},
};
