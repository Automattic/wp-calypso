import { sitePluginDeactivateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const deactivateAction: Action< PluginListRow > = {
	id: 'deactivate',
	label: __( 'Deactivate' ),
	modalHeader: getModalHeader( 'deactivate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
		const { mutateAsync } = useMutation( sitePluginDeactivateMutation() );
		const action = buildBulkSitesPluginAction( mutateAsync );

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
