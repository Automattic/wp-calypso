/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const TRACKABLE_TAG_NAMES = [ 'BUTTON', 'SELECT' ];

/**
 * Return the event definition object to track `wpcom_block_editor_custom_post_template_save`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	selector: '.edit-post-sidebar .components-panel__body',
	type: 'click',
	capture: true,
	handler: ( event ) => {
		if ( ! TRACKABLE_TAG_NAMES.includes( event.target.tagName ) ) {
			return;
		}

		let clickedElement;
		if ( event.target.classList.contains( 'components-panel__body-toggle' ) ) {
			clickedElement = 'panel-toggle';
		} else if ( event.target.classList.contains( 'components-select-control__input' ) ) {
			clickedElement = 'dropdown';
		} else if ( event.target.innerText === __( 'Edit' ) ) {
			clickedElement = 'button-edit';
		} else if ( event.target.innerText === __( 'New' ) ) {
			clickedElement = 'button-new';
		}

		tracksRecordEvent( 'wpcom_block_editor_custom_post_template_actions_click', {
			clicked_element: clickedElement,
		} );
	},
} );
