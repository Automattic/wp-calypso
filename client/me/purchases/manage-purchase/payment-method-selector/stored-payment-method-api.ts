/**
 * External dependencies
 */
import type { StripeConfiguration } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import wpcomFactory from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Purchase } from 'calypso/lib/purchases/types';

const wpcom = wpcomFactory.undocumented();

type StoredCardEndpointResponse = unknown;

export async function saveCreditCard( {
	token,
	stripeConfiguration,
}: {
	token: string;
	stripeConfiguration: StripeConfiguration;
} ): Promise< StoredCardEndpointResponse > {
	const additionalData = getParamsForApi( token, stripeConfiguration );
	const response = await wpcom.me().storedCardAdd( token, additionalData );
	if ( response.error ) {
		recordTracksEvent( 'calypso_purchases_add_new_payment_method_error' );
		throw new Error( response );
	}
	recordTracksEvent( 'calypso_purchases_add_new_payment_method' );
	return response;
}

export async function updateCreditCard( {
	purchase,
	token,
	stripeConfiguration,
}: {
	purchase: Purchase;
	token: string;
	stripeConfiguration: StripeConfiguration;
} ): Promise< StoredCardEndpointResponse > {
	const updatedCreditCardApiParams = getParamsForApi( token, stripeConfiguration, purchase );
	const response = await wpcom.updateCreditCard( updatedCreditCardApiParams );
	if ( response.error ) {
		recordTracksEvent( 'calypso_purchases_save_new_payment_method_error' );
		throw new Error( response );
	}
	recordTracksEvent( 'calypso_purchases_save_new_payment_method' );
	return response;
}

function getParamsForApi(
	cardToken: string,
	stripeConfiguration: StripeConfiguration,
	purchase?: Purchase | undefined
) {
	return {
		payment_partner: stripeConfiguration ? stripeConfiguration.processor_id : '',
		paygate_token: cardToken,
		...( purchase ? { purchaseId: purchase.id } : {} ),
	};
}
