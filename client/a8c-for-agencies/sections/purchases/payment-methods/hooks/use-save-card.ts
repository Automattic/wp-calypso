import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isClientView } from '../lib/is-client-view';

type Props = {
	useAsPrimaryPaymentMethod?: boolean;
	stripeSetupIntentId?: string;
};

export function useSaveCard( {
	useAsPrimaryPaymentMethod,
	stripeSetupIntentId,
}: Props ): ( token: string ) => Promise< unknown > {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const isClient = isClientView();

	return useCallback(
		async ( token: string ) => {
			const response = await wpcom.req.post(
				{
					apiNamespace: 'wpcom/v2',
					path: isClient
						? '/agency-client/stripe/payment-method'
						: '/jetpack-licensing/stripe/payment-method',
				},
				{
					...( ! isClient && agencyId && { agency_id: agencyId } ),
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
		[ agencyId, dispatch, isClient, stripeSetupIntentId, useAsPrimaryPaymentMethod ]
	);
}
