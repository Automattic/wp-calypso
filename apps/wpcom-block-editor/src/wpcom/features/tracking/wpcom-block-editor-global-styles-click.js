/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_global_styles_click`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: `.edit-site-header__actions button[aria-label="${ __( 'Global Styles' ) }"]`,
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_global_styles_click' ),
} );
