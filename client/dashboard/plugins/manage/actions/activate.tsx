import { sitePluginActivateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildBulkSitesPluginAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const activateAction: Action< PluginListRow > = {
	id: 'activate',
	label: __( 'Activate' ),
	modalHeader: getModalHeader( 'activate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
		const { mutateAsync } = useMutation( sitePluginActivateMutation() );
		const action = buildBulkSitesPluginAction( mutateAsync );

		return (
			<ActionRenderModal
				actionId="activate"
				items={ items }
				closeModal={ closeModal }
				onActionPerformed={ onActionPerformed }
				onExecute={ action }
			/>
		);
	},
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'none' ].includes( item.isActive );
	},
	supportsBulk: true,
};
