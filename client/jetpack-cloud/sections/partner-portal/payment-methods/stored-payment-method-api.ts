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
	useAsPrimaryPaymentMethod,
}: {
	token: string;
	stripeConfiguration: StripeConfiguration;
	useAsPrimaryPaymentMethod: boolean;
} ): Promise< StoredCardEndpointResponse > {
	const additionalData = getParamsForApi( {
		cardToken: token,
		stripeConfiguration,
		useAsPrimaryPaymentMethod,
	} );
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
	const updatedCreditCardApiParams = getParamsForApi( {
		cardToken: token,
		stripeConfiguration,
		purchase,
	} );
	const response = await wpcom.updateCreditCard( updatedCreditCardApiParams );
	if ( response.error ) {
		recordTracksEvent( 'calypso_purchases_save_new_payment_method_error' );
		throw new Error( response );
	}
	recordTracksEvent( 'calypso_purchases_save_new_payment_method' );
	return response;
}

function getParamsForApi( {
	cardToken,
	stripeConfiguration,
	purchase,
	useAsPrimaryPaymentMethod,
}: {
	cardToken: string;
	stripeConfiguration: StripeConfiguration;
	purchase?: Purchase | undefined;
	useAsPrimaryPaymentMethod?: boolean;
} ) {
	return {
		payment_partner: stripeConfiguration ? stripeConfiguration.processor_id : '',
		paygate_token: cardToken,
		...( useAsPrimaryPaymentMethod === true ? { use_for_existing: true } : {} ),
		...( useAsPrimaryPaymentMethod === false ? { use_for_existing: false } : {} ), // if undefined, we do not add this property
		...( purchase ? { purchaseId: purchase.id } : {} ),
	};
}
