import { Button, Modal } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import './style.scss';

interface PlaygroundConfirmModalProps {
	title: string;
	children: ReactNode;
	confirmLabel: string;
	onConfirm: () => void;
	/**
	 * Called for every dismissal: the cancel button, the × button, Escape and
	 * clicks outside the modal.
	 */
	onCancel: () => void;
	cancelLabel?: string;
	isConfirming?: boolean;
	className?: string;
}

export function PlaygroundConfirmModal( {
	title,
	children,
	confirmLabel,
	onConfirm,
	onCancel,
	cancelLabel,
	isConfirming = false,
	className,
}: PlaygroundConfirmModalProps ) {
	const { __ } = useI18n();
	const bodyId = useInstanceId( PlaygroundConfirmModal, 'playground-confirm-modal__body' );

	return (
		<Modal
			title={ title }
			aria={ { describedby: bodyId } }
			onRequestClose={ onCancel }
			focusOnMount="firstContentElement"
			className={ clsx( 'playground-confirm-modal', className ) }
		>
			<div id={ bodyId } className="playground-confirm-modal__body">
				{ children }
			</div>
			<div className="playground-confirm-modal__actions">
				<Button
					className="playground-confirm-modal__cancel"
					variant="tertiary"
					onClick={ onCancel }
				>
					{ cancelLabel ?? __( 'Keep building' ) }
				</Button>
				<Button
					className="playground-confirm-modal__confirm"
					variant="primary"
					onClick={ onConfirm }
					isBusy={ isConfirming }
					disabled={ isConfirming }
					accessibleWhenDisabled
				>
					{ confirmLabel }
				</Button>
			</div>
		</Modal>
	);
}
