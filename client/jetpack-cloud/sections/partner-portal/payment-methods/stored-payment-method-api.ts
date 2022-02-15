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
		stripeConfiguration,
		useAsPrimaryPaymentMethod,
	} );

	const response = await wp.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: '/jetpack/store-payment-method',
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
	stripeConfiguration,
	useAsPrimaryPaymentMethod,
}: {
	stripeConfiguration: StripeConfiguration;
	useAsPrimaryPaymentMethod: boolean;
} ) {
	return {
		payment_partner: stripeConfiguration.processor_id,
		use_for_existing: useAsPrimaryPaymentMethod,
	};
}
