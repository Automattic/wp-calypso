import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIPartner, ToSConsent } from 'calypso/state/partner-portal/types';

function mutationTOSConsent(): Promise< APIPartner > {
	return wpcom.req.post( {
		method: 'PUT',
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/partner',
		body: { tos: ToSConsent.Consented },
	} );
}

export default function useTOSConsentMutation< TVariables = void, TContext = unknown >(
	options?: UseMutationOptions< APIPartner, Error, TVariables, TContext >
): UseMutationResult< APIPartner, Error, TVariables, TContext > {
	return useMutation< APIPartner, Error, TVariables, TContext >( {
		...options,
		mutationFn: mutationTOSConsent,
	} );
}
