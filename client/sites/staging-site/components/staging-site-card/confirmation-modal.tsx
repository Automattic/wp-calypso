import styled from '@emotion/styled';
import { Modal, Button } from '@wordpress/components';
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
	isConfirmationDisabled?: boolean;
	disabled?: boolean;
	children: React.ReactNode;
	modalTitle: string;
	modalMessage?: string;
	modalSize?: 'small' | 'medium' | 'large' | 'fill';
	extraModalContent?: React.ReactNode;
	confirmLabel: string;
	cancelLabel: string;
	isSynchronize?: boolean;
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
	children,
	modalTitle,
	modalMessage,
	modalSize,
	extraModalContent,
	confirmLabel,
	cancelLabel,
	isSynchronize = false,
}: ConfirmationModalButtonProps ) {
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	const getButtonVariant = () => {
		if ( isSynchronize ) {
			return 'tertiary';
		}
		if ( isPrimary ) {
			return 'primary';
		}
		if ( isBorderless || isPlain || isTransparent ) {
			return 'tertiary';
		}
		return 'secondary';
	};

	return (
		<>
			<Button
				variant={ getButtonVariant() }
				isDestructive={ isScary }
				isBusy={ isBusy }
				disabled={ disabled }
				onClick={ openModal }
				__next40pxDefaultSize
			>
				{ children }
			</Button>
			{ isOpen && (
				<Modal
					title={ modalTitle }
					onRequestClose={ closeModal }
					{ ...( modalSize && { size: modalSize } ) }
				>
					{ modalMessage && <p>{ modalMessage }</p> }
					{ extraModalContent }
					<ActionButtons>
						<Button
							onClick={ () => {
								onCancel?.();
								closeModal();
							} }
							variant="tertiary"
							__next40pxDefaultSize
						>
							{ cancelLabel }
						</Button>
						<Button
							disabled={ isConfirmationDisabled }
							variant="primary"
							onClick={ () => {
								onConfirm?.();
								closeModal();
							} }
							isBusy={ isBusy }
							__next40pxDefaultSize
						>
							{ confirmLabel }
						</Button>
					</ActionButtons>
				</Modal>
			) }
		</>
	);
}
