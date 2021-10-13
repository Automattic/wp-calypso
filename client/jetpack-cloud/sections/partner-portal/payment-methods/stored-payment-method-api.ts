import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import type { StripeConfiguration } from '@automattic/calypso-stripe';

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

	const response = await wp.req.post(
		{
			path: '/me/stored-cards',
		},
		{
			payment_key: token,
			...( additionalData ?? {} ),
		}
	);
	if ( response.error ) {
		recordTracksEvent( 'calypso_partner_portal_add_new_credit_card_error' );
		throw new Error( response );
	}

	recordTracksEvent( 'calypso_partner_portal_add_new_credit_card' );
	return response;
}

function getParamsForApi( {
	cardToken,
	stripeConfiguration,
	useAsPrimaryPaymentMethod,
}: {
	cardToken: string;
	stripeConfiguration: StripeConfiguration;
	useAsPrimaryPaymentMethod: boolean;
} ) {
	return {
		payment_partner: stripeConfiguration.processor_id,
		paygate_token: cardToken,
		use_for_existing: useAsPrimaryPaymentMethod,
	};
}
