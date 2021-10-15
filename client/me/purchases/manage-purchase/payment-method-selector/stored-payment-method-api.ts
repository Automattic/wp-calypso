import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { Purchase } from 'calypso/lib/purchases/types';

type StoredCardEndpointResponse = unknown;

export async function saveCreditCard( {
	token,
	stripeConfiguration,
	useForAllSubscriptions,
}: {
	token: string;
	stripeConfiguration: StripeConfiguration;
	useForAllSubscriptions: boolean;
} ): Promise< StoredCardEndpointResponse > {
	const additionalData = getParamsForApi( {
		cardToken: token,
		stripeConfiguration,
		useForAllSubscriptions,
	} );
	const response = await wp.req.post(
		{
			path: '/me/stored-cards',
		},
		{
			payment_key: token,
			use_for_existing: true,
			...( additionalData ?? {} ),
		}
	);
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
	useForAllSubscriptions,
}: {
	purchase: Purchase;
	token: string;
	stripeConfiguration: StripeConfiguration;
	useForAllSubscriptions: boolean;
} ): Promise< StoredCardEndpointResponse > {
	const { purchaseId, payment_partner, paygate_token, use_for_existing } = getParamsForApi( {
		cardToken: token,
		stripeConfiguration,
		purchase,
		useForAllSubscriptions,
	} );
	const response = await wp.req.post( '/upgrades/' + purchaseId + '/update-credit-card', {
		payment_partner,
		paygate_token,
		use_for_existing,
	} );
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
	useForAllSubscriptions,
}: {
	cardToken: string;
	stripeConfiguration: StripeConfiguration;
	purchase?: Purchase | undefined;
	useForAllSubscriptions?: boolean;
} ) {
	return {
		payment_partner: stripeConfiguration ? stripeConfiguration.processor_id : '',
		paygate_token: cardToken,
		...( useForAllSubscriptions === true ? { use_for_existing: true } : {} ),
		...( useForAllSubscriptions === false ? { use_for_existing: false } : {} ), // if undefined, we do not add this property
		...( purchase ? { purchaseId: purchase.id } : {} ),
	};
}
