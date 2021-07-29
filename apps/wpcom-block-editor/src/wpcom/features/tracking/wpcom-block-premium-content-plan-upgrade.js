import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_premium_content_upgrade_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-premium-content-plan-upgrade',
	selector: '.wp-block[data-type="premium-content/container"] .plan-nudge__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_premium_content_plan_upgrade_click' ),
} );
