import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import {
	GitHubConnection,
	USE_GITHUB_REPOS_QUERY_KEY,
} from 'calypso/my-sites/hosting/github/use-github-connection';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';

import './style.scss';

interface DisconnectGitHubButtonProps {
	connection: GitHubConnection;
}

export function DisconnectGitHubButton( { connection }: DisconnectGitHubButtonProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	// Using ReactQuery to manage `isDisconnecting` state because it's not exposed from the Redux store.
	const mutation = useMutation< unknown, unknown, GitHubConnection >( async ( c ) => {
		await dispatch( deleteStoredKeyringConnection( c ) );
		await queryClient.invalidateQueries( { queryKey: [ USE_GITHUB_REPOS_QUERY_KEY ] } );
	} );
	const { mutate: disconnect, isLoading: isDisconnecting } = mutation;

	return (
		<Button
			compact
			className="disconnect-github"
			borderless
			onClick={ () => disconnect( connection ) }
			busy={ isDisconnecting }
			disabled={ isDisconnecting } // `busy` doesn't actually disable the button
		>
			{ __( '(disconnect)' ) }
		</Button>
	);
}
