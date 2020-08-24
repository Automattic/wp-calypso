/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_donations_upgrade_click`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.wp-block[data-type="a8c/donations"] .plan-nudge__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_donations_plan_upgrade_click' ),
} );
