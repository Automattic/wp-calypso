import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildOnExecuteForAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const deactivateAction: Action< PluginListRow > = {
	id: 'deactivate',
	label: __( 'Deactivate' ),
	modalHeader: getModalHeader( 'deactivate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => (
		<ActionRenderModal
			actionId="deactivate"
			items={ items }
			closeModal={ closeModal }
			onActionPerformed={ onActionPerformed }
			onExecute={ buildOnExecuteForAction( 'deactivate' ) }
		/>
	),
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'all' ].includes( item.isActive );
	},
	supportsBulk: true,
};
