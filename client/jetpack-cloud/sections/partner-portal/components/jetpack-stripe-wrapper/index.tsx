/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CreditCardEntryForm from 'calypso/jetpack-cloud/sections/partner-portal/components/credit-card-entry-form';

export default function JetpackStripeWrapper(): ReactElement {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider
			locale={ locale }
			configurationArgs={ { needs_intent: true } }
			fetchStripeConfiguration={ getStripeConfiguration }
		>
			<CreditCardEntryForm />
		</StripeHookProvider>
	);
}
