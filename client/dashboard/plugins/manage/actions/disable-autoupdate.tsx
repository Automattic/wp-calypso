import { __ } from '@wordpress/i18n';
import ActionRenderModal, { getModalHeader } from '../components/action-render-modal';
import { buildOnExecuteForAction } from '../utils';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const disableAutoupdateAction: Action< PluginListRow > = {
	id: 'disable-autoupdate',
	label: __( 'Disable auto‑updates' ),
	modalHeader: getModalHeader( 'disable-autoupdate' ),
	RenderModal: ( { items, closeModal, onActionPerformed } ) => (
		<ActionRenderModal
			actionId="disable-autoupdate"
			items={ items }
			closeModal={ closeModal }
			onActionPerformed={ onActionPerformed }
			onExecute={ buildOnExecuteForAction( 'disable-autoupdate' ) }
		/>
	),
	isEligible: ( item: PluginListRow ) => {
		return [ 'some', 'all' ].includes( item.areAutoUpdatesEnabled );
	},
	supportsBulk: true,
};
