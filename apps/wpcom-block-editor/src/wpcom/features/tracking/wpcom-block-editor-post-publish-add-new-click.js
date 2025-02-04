import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_post_publish_add_new_click`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-post-public-add-new-click',
	selector: '.post-publish-panel__postpublish-buttons [href*="post-new.php"]',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_post_publish_add_new_click' ),
} );
