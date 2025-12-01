import {
	invalidatePlugins,
	invalidateSitePlugins,
	sitePluginActivateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { _n, sprintf } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const activateAction: Action< PluginListRow > = {
	id: 'activate',
	label: ( items ) => {
		const [ plugin ] = items;
		const inactiveCount = plugin.sitesWithPluginInactive.length;

		return sprintf(
			// translators: %(count)d is the number of sites the plugin will be activated on.
			_n( 'Activate on %(count)d site', 'Activate on %(count)d sites', inactiveCount ),
			{ count: inactiveCount }
		);
	},
	modalHeader: getModalHeader( 'activate' ),
	RenderModal: ( { items, closeModal } ) => {
		const { mutateAsync } = useMutation( {
			...sitePluginActivateMutation(),
			onSuccess: () => {},
		} );
		const action = buildBulkSitesPluginAction( mutateAsync );

		return (
			<ActionRenderModal
				actionId="activate"
				items={ items.map( ( item ) => ( {
					...item,
					siteIds: item.siteIds.filter( ( siteId ) =>
						item.sitesWithPluginInactive.includes( siteId )
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
		return [ 'some', 'none' ].includes( item.isActive );
	},
};
