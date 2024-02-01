import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'calypso/state';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';
import { Connection, GITHUB_CONNECTION_QUERY_KEY } from './use-github-authorization-query';

export const useGitHubDeauthorizeMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	// Using ReactQuery to manage `isDisconnecting` state because it's not exposed from the Redux store.
	const mutation = useMutation< unknown, unknown, Connection >( {
		mutationFn: async ( c ) => {
			await dispatch( deleteStoredKeyringConnection( c ) );
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, GITHUB_CONNECTION_QUERY_KEY ],
			} );
		},
	} );

	const { mutate: deauthorize, isPending: isDeauthorizing } = mutation;

	return {
		deauthorize,
		isDeauthorizing,
	};
};
