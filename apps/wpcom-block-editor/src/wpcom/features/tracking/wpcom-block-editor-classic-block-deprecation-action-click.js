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
		[ __( 'Convert to HTML' ) ]: 'convert_to_html',
	};
	return mapLabelToAction[ label ] ?? 'unknown';
};

/**
 * Track clicks on the experimental deprecation notice action buttons inside a
 * Classic (`core/freeform`) block.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-classic-block-deprecation-action-click',
	selector: '.wp-block-freeform .block-editor-warning__action > button',
	type: 'click',
	capture: true,
	handler: ( _event, target ) => {
		const action = getActionId( target.innerText?.trim() ?? '' );
		tracksRecordEvent( 'wpcom_block_editor_classic_block_deprecation_action_click', {
			action,
		} );
	},
} );
