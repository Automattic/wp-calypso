import { Button } from '@automattic/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';
import { GITHUB_CONNECTION_QUERY_KEY } from '../use-github-connection-query';
import './style.scss';

type Connection = Parameters< typeof deleteStoredKeyringConnection >[ 0 ];

interface DisconnectGitHubButtonProps {
	connection: Connection;
}

export function DisconnectGitHubButton( { connection }: DisconnectGitHubButtonProps ) {
	const queryClient = useQueryClient();
	const siteId = useSelector( getSelectedSiteId );
	const { __ } = useI18n();
	const dispatch = useDispatch();
	// Using ReactQuery to manage `isDisconnecting` state because it's not exposed from the Redux store.
	const mutation = useMutation< unknown, unknown, Connection >( {
		mutationFn: async ( c ) => {
			dispatch( recordTracksEvent( 'calypso_hosting_github_unauthorize_click' ) );
			await dispatch( deleteStoredKeyringConnection( c ) );
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ],
			} );
		},
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
