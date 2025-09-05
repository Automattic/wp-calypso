import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildOnExecuteForAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const updateAction: Action< PluginListRow > = {
	id: 'update',
	label: __( 'Update' ),
	modalHeader: getModalHeader( 'update' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => (
		<ActionRenderModal
			actionId="update"
			items={ items }
			closeModal={ closeModal }
			onActionPerformed={ onActionPerformed }
			onExecute={ buildOnExecuteForAction( 'update' ) }
		/>
	),
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'all' ].includes( item.hasUpdate );
	},
};
