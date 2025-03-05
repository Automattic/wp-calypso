import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface MutationVariables {
	accessToken: string;
}

export const useSaveGitHubCredentialsMutation = () => {
	const mutation = useMutation( {
		mutationFn: async ( { accessToken }: MutationVariables ) =>
			wp.req.post(
				{
					path: '/hosting/github/accounts',
					apiNamespace: 'wpcom/v2',
				},
				{
					access_token: accessToken,
				}
			),
	} );

	const { mutateAsync, isPending } = mutation;

	const saveGitHubCredentials = useCallback(
		( args: MutationVariables ) => mutateAsync( args ),
		[ mutateAsync ]
	);

	return { saveGitHubCredentials, isPending };
};
