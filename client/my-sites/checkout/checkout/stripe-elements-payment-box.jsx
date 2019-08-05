/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { StripeProvider, Elements } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import CreditCardPaymentBox from './credit-card-payment-box';
import { useStripeConfiguration, useStripeJs } from 'lib/stripe';

export function StripeElementsPaymentBox( {
	translate,
	cart,
	children,
	selectedSite,
	initialCard,
	countriesList,
	onSubmit,
	transaction,
	presaleChatAvailable,
	cards,
} ) {
	// TODO: send the country to useStripeConfiguration
	const stripeConfiguration = useStripeConfiguration();
	const stripeJs = useStripeJs( stripeConfiguration );
	return (
		<StripeProvider stripe={ stripeJs }>
			<Elements>
				<CreditCardPaymentBox
					translate={ translate }
					cards={ cards }
					transaction={ transaction }
					cart={ cart }
					countriesList={ countriesList }
					initialCard={ initialCard }
					selectedSite={ selectedSite }
					onSubmit={ onSubmit }
					transactionStep={ transaction.step }
					presaleChatAvailable={ presaleChatAvailable }
					stripeConfiguration={ stripeConfiguration }
				>
					{ children }
				</CreditCardPaymentBox>
			</Elements>
		</StripeProvider>
	);
}
export default localize( StripeElementsPaymentBox );
