import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';

const SET_SITE_INTERFACE_MUTATION_KEY = 'set-site-interface-mutation-key';

interface MutationVariables {
	value: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useSiteInterfaceMutation = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const queryKey = [ SET_SITE_INTERFACE_MUTATION_KEY, siteId ];
	const mutation = useMutation( {
		mutationFn: async ( { value }: MutationVariables ) => {
			return wp.req.post(
				{
					path: `/sites/${ siteId }/hosting/admin-interface`,
					apiNamespace: 'wpcom/v2',
				},
				{
					interface: value,
				}
			);
		},
		mutationKey: queryKey,
		onSuccess: options?.onSuccess,
		onMutate: options?.onMutate,
		onError( _err: MutationError, _newActive: MutationVariables, prevValue: unknown ) {
			// Revert to previous settings on failure
			queryClient.setQueryData( queryKey, prevValue );
			options?.onError?.( _err, _newActive, prevValue );
		},
		onSettled: () => {
			dispatch( requestSite( siteId ) );
		},
	} );

	const { mutate } = mutation;

	const setSiteInterface = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return setSiteInterface;
};
