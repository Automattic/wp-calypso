import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

export async function saveCreditCard( {
	token,
	useAsPrimaryPaymentMethod,
}: {
	token: string;
	useAsPrimaryPaymentMethod: boolean;
} ): Promise< unknown > {
	const additionalData = getParamsForApi( {
		useAsPrimaryPaymentMethod,
	} );

	const response = await wpcomJpl.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: '/jetpack/stripe/store-payment-method',
		},
		{
			payment_method_id: token,
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

function getParamsForApi( { useAsPrimaryPaymentMethod }: { useAsPrimaryPaymentMethod: boolean } ) {
	return {
		use_as_primary_payment_method: useAsPrimaryPaymentMethod,
	};
}
