import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_tag_education_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-tag-education-click',
	selector: 'a[href="https://wordpress.com/blog/2014/04/21/better-tagging/"]',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_tag_education_click' ),
} );
