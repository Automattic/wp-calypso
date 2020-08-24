/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_premium_content_stripe_connect_click `.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.wp-block[data-type="premium-content/container"] .stripe-nudge__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_premium_content_stripe_connect_click' ),
} );
