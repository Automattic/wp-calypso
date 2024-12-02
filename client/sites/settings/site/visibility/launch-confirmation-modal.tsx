import styled from '@emotion/styled';
import { Modal, Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
	justifyContent: 'flex-end',
} );

type LaunchConfirmationModalProps = {
	onConfirmation: () => void;
	closeModal: () => void;
	message: string;
};

export function LaunchConfirmationModal( {
	closeModal,
	message,
	onConfirmation,
}: LaunchConfirmationModalProps ) {
	const modalTitle = translate( "You're about to launch this website" );

	return (
		<Modal title={ modalTitle } onRequestClose={ closeModal } size="medium">
			{ message && <p>{ message }</p> }
			<p>{ translate( 'Ready to launch?' ) }</p>
			<ActionButtons>
				<Button
					variant="secondary"
					onClick={ () => {
						closeModal();
					} }
				>
					{ translate( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ onConfirmation }>
					{ translate( 'Launch site' ) }
				</Button>
			</ActionButtons>
		</Modal>
	);
}
