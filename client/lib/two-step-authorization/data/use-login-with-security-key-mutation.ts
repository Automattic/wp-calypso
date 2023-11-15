import { get as webauthnAuth } from '@github/webauthn-json';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { postLoginRequest } from './post-login-request';
import { useTwoStepAuthQuery } from './use-two-step-auth-query';

export const useLoginWithSecurityKeyMutation = () => {
	const queryClient = useQueryClient();
	const { data } = useTwoStepAuthQuery();
	const mutation = useMutation( {
		mutationFn: async ( { user_id }: { user_id: number } ) => {
			const challenge = await postLoginRequest( {
				twoStepWebauthnNonce: data?.twoStepWebauthnNonce,
				endpoint: 'webauthn-challenge-endpoint',
				data: { user_id },
			} );
			const parameters = challenge.data || [];
			if ( typeof parameters.two_step_nonce === 'undefined' ) {
				return Promise.reject( challenge );
			}
			const assertion = await webauthnAuth( { publicKey: parameters } );
			const response = await postLoginRequest( {
				twoStepWebauthnNonce: challenge.data.two_step_nonce,
				endpoint: 'webauthn-authentication-endpoint',
				data: {
					user_id: user_id,
					client_data: JSON.stringify( assertion ),
					create_2fa_cookies_only: 1,
				},
			} );
			if ( ! response.success ) {
				return Promise.reject( response );
			}
			return response;
		},
		onSuccess() {
			queryClient.setQueryData( [ 'two-step-auth' ], {
				two_step_reauthorization_required: false,
			} );
			queryClient.invalidateQueries( { queryKey: [ 'two-step-auth' ] } );
		},
		onError() {
			queryClient.refetchQueries( { queryKey: [ 'two-step-auth' ] } );
		},
	} );

	const { mutateAsync } = mutation;

	const loginWithSecurityKey = useCallback(
		async ( user_id: number ) => {
			return mutateAsync( { user_id } );
		},
		[ mutateAsync ]
	);

	return { ...mutation, loginWithSecurityKey };
};
