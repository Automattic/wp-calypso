import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import './style.scss';

type Connection = Parameters< typeof deleteStoredKeyringConnection >[ 0 ];

interface DisconnectGitHubExpanderProps {
	connection: Connection;
}

export function DisconnectGitHubExpander( { connection }: DisconnectGitHubExpanderProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	// Using ReactQuery to manage `isDisconnecting` state because it's not exposed from the Redux store.
	const mutation = useMutation< unknown, unknown, Connection >(
		async ( c ) => await dispatch( deleteStoredKeyringConnection( c ) )
	);
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
