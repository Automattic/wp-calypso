/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CreditCardPaymentBox from './credit-card-payment-box';
import { StripeHookProvider } from 'lib/stripe';

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
	return (
		<StripeHookProvider>
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
			>
				{ children }
			</CreditCardPaymentBox>
		</StripeHookProvider>
	);
}
export default localize( StripeElementsPaymentBox );
