import styled from '@emotion/styled';
import { Modal, Button } from '@wordpress/components';
import { useState } from 'react';

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
			) }
			{ isOpen && (
				<Modal
					title={ modalTitle }
					onRequestClose={ closeModal }
					{ ...( modalSize && { size: modalSize } ) }
				>
					{ modalMessage && <p>{ modalMessage }</p> }
					{ extraModalContent }
					<ActionButtons>
						<TertiaryButtonWrapper>
							<Button
								onClick={ () => {
									onCancel?.();
									closeModal();
								} }
								variant="tertiary"
								__next40pxDefaultSize
							>
								<ButtonContent>{ cancelLabel }</ButtonContent>
							</Button>
						</TertiaryButtonWrapper>
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
							<ButtonContent>{ confirmLabel }</ButtonContent>
						</Button>
					</ActionButtons>
				</Modal>
			) }
		</>
	);
}
