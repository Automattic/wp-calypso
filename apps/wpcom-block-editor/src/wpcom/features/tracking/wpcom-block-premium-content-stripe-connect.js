import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_premium_content_stripe_connect_click `.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-premium-content-stripe-connect',
	selector: '.wp-block[data-type="premium-content/container"] .stripe-nudge__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_premium_content_stripe_connect_click' ),
} );
