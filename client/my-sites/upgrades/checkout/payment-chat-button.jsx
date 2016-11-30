/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import OlarkChatButton from 'components/olark-chat-button';

export default localize( ( { cart, translate, paymentType, transactionStep } ) => {
	return (
		<OlarkChatButton
			borderless
			className="checkout__payment-chat-button"
			chatContext="presale"
			tracksData={ {
				payment_type: paymentType,
				transaction_step: transactionStep,
				product_slug: cart.products[ 0 ].product_slug,
			} }
			title={ translate( 'Need help? Chat with us' ) } />
	);
} );
