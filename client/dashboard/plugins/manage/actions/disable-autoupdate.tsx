import { sitePluginAutoupdateDisableMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const disableAutoupdateAction: Action< PluginListRow > = {
	id: 'disable-autoupdate',
	label: __( 'Disable auto‑updates' ),
	modalHeader: getModalHeader( 'disable-autoupdate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
		const { mutateAsync } = useMutation( sitePluginAutoupdateDisableMutation() );
		const action = buildBulkSitesPluginAction( mutateAsync );

		return (
			<ActionRenderModal
				actionId="disable-autoupdate"
				items={ items }
				closeModal={ closeModal }
				onActionPerformed={ onActionPerformed }
				onExecute={ action }
			/>
		);
	},
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'all' ].includes( item.areAutoUpdatesEnabled );
	},
	supportsBulk: true,
};
