/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_donations_stripe_connect_click `.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.wp-block[data-type="a8c/donations"] .stripe-nudge__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_donations_stripe_connect_click' ),
} );
