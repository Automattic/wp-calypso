import { __ } from '@wordpress/i18n';
import tracksRecordEvent from './track-record-event';

/**
 * Map a translated button label to a locale-independent action id.
 * @param {string} label The button's trimmed innerText.
 * @returns {string} A stable identifier for the action, or `'unknown'`.
 */
const getActionId = ( label ) => {
	const mapLabelToAction = {
		[ __( 'Convert to blocks' ) ]: 'convert_to_blocks',
		[ __( 'Keep as HTML' ) ]: 'keep_as_html',
	};
	return mapLabelToAction[ label ] ?? 'unknown';
};

/**
 * Track clicks on warning action buttons inside a `.wp-block-missing` block.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-missing-block-action-click',
	selector: '.wp-block-missing .block-editor-warning__action > button',
	type: 'click',
	capture: true,
	handler: ( _event, target ) => {
		const action = getActionId( target.innerText?.trim() ?? '' );

		const actionsContainer = target.closest( '.block-editor-warning__actions' );
		const siblingButtons = Array.from(
			actionsContainer?.querySelectorAll( '.block-editor-warning__action > button' ) ?? []
		);
		// Sort so the same set of actions always produces the same string.
		const availableActions = siblingButtons
			.map( ( button ) => getActionId( button.innerText?.trim() ?? '' ) )
			.sort()
			.join( ',' );

		tracksRecordEvent( 'wpcom_block_editor_missing_block_action_click', {
			action,
			available_actions: availableActions,
		} );
	},
} );
