import { useCallback } from 'react';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	useAsPrimaryPaymentMethod?: boolean;
	stripeSetupIntentId?: string;
};

export function useSaveCard( {
	useAsPrimaryPaymentMethod,
	stripeSetupIntentId,
}: Props ): ( token: string ) => Promise< unknown > {
	const dispatch = useDispatch();

	return useCallback(
		async ( token: string ) => {
			const response = await wpcomJpl.req.post(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/stripe/payment-method', // FIXME: Update this to the correct endpoint.
				},
				{
					payment_method_id: token,
					use_as_primary_payment_method: useAsPrimaryPaymentMethod,
					stripe_setup_intent_id: stripeSetupIntentId,
				}
			);

			if ( response.error ) {
				dispatch( recordTracksEvent( 'calypso_a4a_add_new_credit_card_error' ) );
				throw new Error( response );
			}

			dispatch( recordTracksEvent( 'calypso_a4a_add_new_credit_card' ) );
			return response;
		},
		[ dispatch, stripeSetupIntentId, useAsPrimaryPaymentMethod ]
	);
}
