import { recordTracksEvent } from '@automattic/calypso-analytics';
import requestExternalAccess from '@automattic/request-external-access';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'calypso/state';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';
import {
	GITHUB_CONNECTION_QUERY_KEY,
	GithubConnectionData,
} from './use-github-authorization-query';

export const useGitHubAuthorizeMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	const { mutate: authorize, isPending: isAuthorizing } = useMutation< void, unknown, string >( {
		mutationFn: async ( connectURL ) => {
			await new Promise( ( resolve ) => requestExternalAccess( connectURL, resolve ) );
			await dispatch( requestKeyringConnections() );
		},
		onSuccess: async () => {
			const connectionKey = [ GITHUB_INTEGRATION_QUERY_KEY, GITHUB_CONNECTION_QUERY_KEY ];
			await queryClient.invalidateQueries( {
				queryKey: connectionKey,
			} );

			const authorized =
				queryClient.getQueryData< GithubConnectionData >( connectionKey )?.connected;
			dispatch( recordTracksEvent( 'calypso_hosting_github_authorize_complete', { authorized } ) );
		},
	} );

	return {
		authorize,
		isAuthorizing,
	};
};
