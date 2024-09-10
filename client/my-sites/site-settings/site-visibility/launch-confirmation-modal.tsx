import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { translate } from 'i18n-calypso';

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
	justifyContent: 'flex-end',
} );

type LaunchConfirmationModalProps = {
	onConfirmation: () => void;
	closeModal: () => void;
	billingAgencyMessage: string;
};

export function LaunchConfirmationModal( {
	closeModal,
	billingAgencyMessage,
	onConfirmation,
}: LaunchConfirmationModalProps ) {
	const modalTitle = translate( "You're about to launch this website" );

	return (
		<>
			<Modal title={ modalTitle } onRequestClose={ closeModal }>
				{ billingAgencyMessage && <p>{ billingAgencyMessage }</p> }
				<p>{ translate( 'Ready to launch?' ) }</p>
				<ActionButtons>
					<Button
						onClick={ () => {
							closeModal();
						} }
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button primary onClick={ onConfirmation }>
						{ translate( 'Launch site' ) }
					</Button>
				</ActionButtons>
			</Modal>
		</>
	);
}
