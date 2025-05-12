import styled from '@emotion/styled';
import { Modal, Button } from '@wordpress/components';
import { useState } from 'react';

const ButtonContent = styled.span( {
	display: 'flex',
	alignItems: 'center',
	gap: '2px',
	fontSize: '14px',

	'.components-button.is-tertiary &': {
		color: 'var( --color-text-subtle )',
	},

	'.components-button.is-tertiary:hover:not( :disabled ) &': {
		color: 'var( --color-text )',
	},
} );

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
	justifyContent: 'flex-end',

	'.components-button.is-primary:disabled': {
		backgroundColor: 'var( --color-surface )',
		borderColor: 'var( --color-neutral-5 )',
		border: '1px solid var( --color-neutral-5 )',
	},

	'.components-button.is-primary:disabled span': {
		color: 'var( --color-neutral-20 )',
	},
} );

const TertiaryButtonWrapper = styled.div( {
	'.components-button.is-tertiary:hover:not( :disabled )': {
		background: 'var( --color-surface )',
	},
} );

const SynchronizeButtonWrapper = styled.div( {
	'.components-button.is-tertiary': {
		border: '1px solid var( --color-border )',
	},

	'.components-button.is-tertiary:hover:not( :disabled )': {
		background: 'var( --color-surface )',
	},

	'.components-button.is-tertiary:not( :disabled ) span': {
		color: 'var( --color-text )',
	},

	'.components-button.is-tertiary:disabled': {
		backgroundColor: 'var( --color-surface )',
		borderColor: 'var( --color-neutral-5 )',
	},

	'.components-button.is-tertiary:disabled span': {
		color: 'var( --color-neutral-20 )',
	},
} );

const DestructiveButtonWrapper = styled.div( {
	'.components-button.is-secondary.is-destructive': {
		boxShadow: 'none',
		border: '1px solid var(--color-neutral-10)',
		'&:hover, &:focus': {
			border: '1px solid var(--wp-components-color-accent)',
			background: 'transparent',
			color: 'var(--color-error)',
			svg: {
				fill: 'var(--color-error)',
			},
		},
	},
} );

type ConfirmationModalButtonProps = {
	onConfirm?: () => void;
	onCancel?: () => void;
	isBusy?: boolean;
	isScary?: boolean;
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

function ModalContent( {
	modalMessage,
	extraModalContent,
	onCancel,
	onConfirm,
	isConfirmationDisabled,
	isBusy,
	confirmLabel,
	cancelLabel,
}: {
	modalMessage?: string;
	extraModalContent?: React.ReactNode;
	onCancel?: () => void;
	onConfirm?: () => void;
	isConfirmationDisabled?: boolean;
	isBusy?: boolean;
	confirmLabel: string;
	cancelLabel: string;
} ) {
	return (
		<>
			{ modalMessage && <p>{ modalMessage }</p> }
			{ extraModalContent }
			<ActionButtons>
				<TertiaryButtonWrapper>
					<Button onClick={ onCancel } variant="tertiary" __next40pxDefaultSize>
						<ButtonContent>{ cancelLabel }</ButtonContent>
					</Button>
				</TertiaryButtonWrapper>
				<Button
					disabled={ isConfirmationDisabled }
					variant="primary"
					onClick={ onConfirm }
					isBusy={ isBusy }
					__next40pxDefaultSize
				>
					<ButtonContent>{ confirmLabel }</ButtonContent>
				</Button>
			</ActionButtons>
		</>
	);
}

export function ConfirmationModal( {
	onConfirm,
	onCancel,
	disabled = false,
	isConfirmationDisabled,
	isBusy = false,
	isScary = false,
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

	const handleConfirm = () => {
		onConfirm?.();
		closeModal();
	};

	const handleCancel = () => {
		onCancel?.();
		closeModal();
	};

	return (
		<>
			{ isSynchronize ? (
				<SynchronizeButtonWrapper>
					<Button
						variant="tertiary"
						isDestructive={ isScary }
						isBusy={ isBusy }
						disabled={ disabled }
						onClick={ openModal }
						__next40pxDefaultSize
					>
						<ButtonContent>{ children }</ButtonContent>
					</Button>
				</SynchronizeButtonWrapper>
			) : (
				<DestructiveButtonWrapper>
					<Button
						variant="secondary"
						isDestructive={ isScary }
						isBusy={ isBusy }
						disabled={ disabled }
						onClick={ openModal }
						__next40pxDefaultSize
					>
						<ButtonContent>{ children }</ButtonContent>
					</Button>
				</DestructiveButtonWrapper>
			) }
			{ isOpen && (
				<Modal
					title={ modalTitle }
					onRequestClose={ closeModal }
					{ ...( modalSize && { size: modalSize } ) }
				>
					<ModalContent
						modalMessage={ modalMessage }
						extraModalContent={ extraModalContent }
						onCancel={ handleCancel }
						onConfirm={ handleConfirm }
						isConfirmationDisabled={ isConfirmationDisabled }
						isBusy={ isBusy }
						confirmLabel={ confirmLabel }
						cancelLabel={ cancelLabel }
					/>
				</Modal>
			) }
		</>
	);
}
