import { Button } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect, useRef, type ReactNode } from 'react';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
import './style.scss';

interface PlaygroundConfirmModalProps {
	title: string;
	children: ReactNode;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => void;
	/**
	 * Called for every dismissal: the cancel button, the × button, Escape and
	 * clicks outside the modal. Never called while `isConfirming`.
	 */
	onCancel: () => void;
	/**
	 * Shows the confirm button as busy and blocks every way of dismissing the
	 * modal, so a dismissal can't be recorded after the user has confirmed.
	 */
	isConfirming?: boolean;
	className?: string;
}

export function PlaygroundConfirmModal( {
	title,
	children,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
	isConfirming = false,
	className,
}: PlaygroundConfirmModalProps ) {
	const bodyId = useInstanceId( PlaygroundConfirmModal, 'playground-confirm-modal__body' );

	// Modal calls `onRequestClose` from the render that started its exit
	// animation, after the animation ends, so read the latest value from a ref.
	const isConfirmingRef = useRef( isConfirming );
	useEffect( () => {
		isConfirmingRef.current = isConfirming;
	}, [ isConfirming ] );

	const cancel = () => {
		if ( ! isConfirmingRef.current ) {
			onCancel();
		}
	};

	return (
		<ConfirmDialog
			title={ title }
			aria={ { describedby: bodyId } }
			onRequestClose={ cancel }
			focusOnMount="firstContentElement"
			isDismissible={ ! isConfirming }
			shouldCloseOnEsc={ ! isConfirming }
			shouldCloseOnClickOutside={ ! isConfirming }
			className={ clsx( 'playground-confirm-modal', className ) }
		>
			<DialogContent id={ bodyId } className="playground-confirm-modal__body">
				{ children }
			</DialogContent>
			<DialogFooter className="playground-confirm-modal__actions">
				<Button
					className="playground-confirm-modal__cancel"
					variant="tertiary"
					onClick={ cancel }
					disabled={ isConfirming }
					accessibleWhenDisabled
				>
					{ cancelLabel }
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
			</DialogFooter>
		</ConfirmDialog>
	);
}
