/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CreditCardPaymentBox from './credit-card-payment-box';
import { withStripe } from 'lib/stripe';

const CreditCardPaymentBoxWithStripe = withStripe( CreditCardPaymentBox );

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
		<CreditCardPaymentBoxWithStripe
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
		</CreditCardPaymentBoxWithStripe>
	);
}
export default localize( StripeElementsPaymentBox );
