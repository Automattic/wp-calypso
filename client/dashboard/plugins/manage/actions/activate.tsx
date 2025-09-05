import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildOnExecuteForAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const activateAction: Action< PluginListRow > = {
	id: 'activate',
	label: __( 'Activate' ),
	modalHeader: getModalHeader( 'activate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => (
		<ActionRenderModal
			actionId="activate"
			items={ items }
			closeModal={ closeModal }
			onActionPerformed={ onActionPerformed }
			onExecute={ buildOnExecuteForAction( 'activate' ) }
		/>
	),
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'none' ].includes( item.isActive );
	},
	supportsBulk: true,
};
