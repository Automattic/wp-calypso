/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import OlarkChatButton from 'components/olark-chat-button';

export default localize( ( { cart, translate, paymentType, transactionStep } ) => {
	const { products } = cart;
	const product = products && products[ 0 ];
	const productSlug = product && product.product_slug;

	return (
		<OlarkChatButton
			borderless
			className="checkout__payment-chat-button"
			chatContext="presale"
			tracksData={ {
				payment_type: paymentType,
				transaction_step: transactionStep && transactionStep.name,
				product_slug: productSlug,
			} }>
				<Gridicon icon="chat" className="checkout__payment-chat-button-icon" />
				{ translate( 'Need help? Chat with us' ) }
		</OlarkChatButton>
	);
} );
