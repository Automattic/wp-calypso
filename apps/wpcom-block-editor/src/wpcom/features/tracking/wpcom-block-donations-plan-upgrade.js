import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_donations_upgrade_click`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-donations-plan-upgrade',
	selector: '.wp-block[data-type="a8c/donations"] .plan-nudge__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_donations_plan_upgrade_click' ),
} );
