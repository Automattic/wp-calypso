import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildOnExecuteForAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const deleteAction: Action< PluginListRow > = {
	id: 'delete',
	label: __( 'Delete' ),
	isPrimary: false,
	modalHeader: getModalHeader( 'delete' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => (
		<ActionRenderModal
			actionId="delete"
			items={ items }
			closeModal={ closeModal }
			onActionPerformed={ onActionPerformed }
			onExecute={ buildOnExecuteForAction( 'remove' ) }
		/>
	),
	isEligible: ( item: PluginListRow ) => {
		return item.isActive === 'none';
	},
	supportsBulk: true,
};
