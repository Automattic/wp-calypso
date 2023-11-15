import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

export const useValidateCodeMutation = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { code, remember2fa }: { code: string; remember2fa: boolean } ) => {
			const response = await wp.req.post( '/me/two-step/validate', {
				code: code.trim(),
				remember2fa,
			} );
			if ( ! response.success ) {
				throw new Error( '2FA code validation failed!' );
			}
			return response;
		},
		onSuccess( data ) {
			if ( data.success ) {
				queryClient.setQueryData( [ 'two-step-auth' ], {
					...queryClient.getQueryData( [ 'two-step-auth' ] ),
					two_step_reauthorization_required: false,
				} );
			}
		},
		onSettled() {
			queryClient.invalidateQueries( [ 'two-step-auth' ] );
		},
	} );

	const { mutateAsync } = mutation;

	const validateCode = useCallback(
		( code: string, remember2fa: boolean ) => mutateAsync( { code, remember2fa } ),
		[ mutateAsync ]
	);

	return { validateCode, ...mutation };
};
