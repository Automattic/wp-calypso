import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { useState } from 'react';

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
	justifyContent: 'flex-end',
} );

type ConfirmationModalButtonProps = {
	onConfirm?: () => void;
	onCancel?: () => void;
	isBusy?: boolean;
	isPrimary?: boolean;
	isScary?: boolean;
	isBorderless?: boolean;
	isPlain?: boolean;
	isTransparent?: boolean;
	isCompact?: boolean;
	isConfirmationDisabled?: boolean;
	disabled?: boolean;
	children: React.ReactNode;
	modalTitle: string;
	modalMessage?: string;
	extraModalContent?: React.ReactNode;
	confirmLabel: string;
	cancelLabel: string;
};

export function ConfirmationModal( {
	onConfirm,
	onCancel,
	disabled = false,
	isConfirmationDisabled,
	isBusy = false,
	isPrimary = false,
	isScary = false,
	isBorderless = false,
	isPlain = false,
	isTransparent = false,
	isCompact = false,
	children,
	modalTitle,
	modalMessage,
	extraModalContent,
	confirmLabel,
	cancelLabel,
}: ConfirmationModalButtonProps ) {
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	return (
		<>
			<Button
				primary={ isPrimary }
				compact={ isCompact }
				scary={ isScary }
				borderless={ isBorderless }
				plain={ isPlain }
				transparent={ isTransparent }
				busy={ isBusy }
				disabled={ disabled }
				onClick={ openModal }
			>
				{ children }
			</Button>
			{ isOpen && (
				<Modal title={ modalTitle } onRequestClose={ closeModal }>
					{ modalMessage && <p>{ modalMessage }</p> }
					{ extraModalContent }
					<ActionButtons>
						<Button
							onClick={ () => {
								onCancel?.();
								closeModal();
							} }
						>
							{ cancelLabel }
						</Button>
						<Button
							disabled={ isConfirmationDisabled }
							primary
							onClick={ () => {
								onConfirm?.();
								closeModal();
							} }
							busy={ isBusy }
						>
							{ confirmLabel }
						</Button>
					</ActionButtons>
				</Modal>
			) }
		</>
	);
}
