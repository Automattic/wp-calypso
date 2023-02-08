import { Button, Gridicon } from '@automattic/components';
import { useInstanceId } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
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
	const panelId = useInstanceId( DisconnectGitHubExpander, 'disconnect-github' ) + '-panel';
	const dispatch = useDispatch();
	const [ isExpanded, setIsExpanded ] = useState( false );

	// Using ReactQuery to manage `isDisconnecting` state because it's not exposed from the Redux store.
	const mutation = useMutation< unknown, unknown, Connection >(
		async ( c ) => await dispatch( deleteStoredKeyringConnection( c ) )
	);
	const { mutate: disconnect, isLoading: isDisconnecting } = mutation;

	return (
		<>
			<button
				className="disconnect-github-expander__button"
				aria-controls={ panelId }
				aria-expanded={ isExpanded }
				onClick={ () => setIsExpanded( ( expanded ) => ! expanded ) }
			>
				<Gridicon icon="chevron-right" size={ 16 } /> { __( 'Disconnect from GitHub' ) }
			</button>
			<div
				id={ panelId }
				className="disconnect-github-expander__panel"
				style={ { display: isExpanded ? 'block' : 'none' } }
			>
				<Button
					scary
					onClick={ () => disconnect( connection ) }
					busy={ isDisconnecting }
					disabled={ isDisconnecting } // `busy` doesn't actually disable the button
				>
					{ __( 'Disconnect' ) }
				</Button>
			</div>
		</>
	);
}
