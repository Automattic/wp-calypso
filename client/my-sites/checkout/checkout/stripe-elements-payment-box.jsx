/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import CreditCardPaymentBox from './credit-card-payment-box';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

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
	const locale = useSelector( getCurrentUserLocale );
	return (
		<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
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
