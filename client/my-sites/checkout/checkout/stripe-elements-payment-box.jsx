/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { StripeHookProvider } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import CreditCardPaymentBox from './credit-card-payment-box';

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
	incompatibleProducts,
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
				incompatibleProducts={ incompatibleProducts }
			>
				{ children }
			</CreditCardPaymentBox>
		</StripeHookProvider>
	);
}
export default localize( StripeElementsPaymentBox );
