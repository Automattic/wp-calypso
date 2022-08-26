import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

interface Params {
	token: string;
	useAsPrimaryPaymentMethod: boolean;
	stripeSetupIntentId: string;
}

export async function saveCreditCard( {
	token,
	useAsPrimaryPaymentMethod,
	stripeSetupIntentId,
}: Params ): Promise< unknown > {
	const response = await wpcomJpl.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/stripe/payment-method',
		},
		{
			payment_method_id: token,
			use_as_primary_payment_method: useAsPrimaryPaymentMethod,
			stripe_setup_intent_id: stripeSetupIntentId,
		}
	);

	if ( response.error ) {
		recordTracksEvent( 'calypso_partner_portal_add_new_credit_card_error' );
		throw new Error( response );
	}

	recordTracksEvent( 'calypso_partner_portal_add_new_credit_card' );
	return response;
}
