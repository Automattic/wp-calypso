import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_donations_stripe_connect_click `.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-donations-stripe-connect',
	selector: '.wp-block[data-type="a8c/donations"] .stripe-nudge__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_donations_stripe_connect_click' ),
} );
