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
	// Not wrapped in translation to avoid request unconfirmed copy
	const modalTitle = 'You’re about to update your production site';

	return (
		<>
			<Modal title={ modalTitle } onRequestClose={ closeModal }>
				{ billingAgencyMessage && (
					<p>
						{ billingAgencyMessage }
						<br />
						Are you sure you want to proceed?
					</p>
				) }
				<ActionButtons>
					<Button
						onClick={ () => {
							closeModal();
						} }
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button primary onClick={ onConfirmation }>
						{ translate( 'Yes, launch site' ) }
					</Button>
				</ActionButtons>
			</Modal>
		</>
	);
}
