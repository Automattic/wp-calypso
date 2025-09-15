import { sitePluginAutoupdateEnableMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const enableAutoupdateAction: Action< PluginListRow > = {
	id: 'enable-autoupdate',
	label: __( 'Enable auto‑updates' ),
	modalHeader: getModalHeader( 'enable-autoupdate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
		const { mutateAsync } = useMutation( sitePluginAutoupdateEnableMutation() );
		const action = buildBulkSitesPluginAction( mutateAsync );

		return (
			<ActionRenderModal
				actionId="enable-autoupdate"
				items={ items }
				closeModal={ closeModal }
				onActionPerformed={ onActionPerformed }
				onExecute={ action }
			/>
		);
	},
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'none' ].includes( item.areAutoUpdatesEnabled );
	},
	supportsBulk: true,
};
