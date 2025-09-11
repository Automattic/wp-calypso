import { sitePluginRemoveMutation } from '@automattic/api-queries';
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
		const { mutateAsync } = useMutation( sitePluginRemoveMutation() );
		const action = buildBulkSitesPluginAction( mutateAsync );

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
	isEligible: ( item: PluginListRow ) => {
		return item.isActive === 'none';
	},
	supportsBulk: true,
};
