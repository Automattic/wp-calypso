import { sitePluginDeactivateMutation } from '@automattic/api-queries';
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
			_n(
				'Deactivate on %(count)d site',
				'Deactivate on %(count)d sites',
				activeCount,
				'next-admin'
			),
			{ count: activeCount }
		);
	},
	modalHeader: getModalHeader( 'deactivate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
		const { mutateAsync } = useMutation( sitePluginDeactivateMutation() );
		const action = buildBulkSitesPluginAction( mutateAsync, items[ 0 ].sitesWithPluginInactive );

		return (
			<ActionRenderModal
				actionId="deactivate"
				items={ items }
				closeModal={ closeModal }
				onActionPerformed={ onActionPerformed }
				onExecute={ action }
			/>
		);
	},
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'all' ].includes( item.isActive );
	},
};
