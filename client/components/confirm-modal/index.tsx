import { Button, Modal } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import './styles.scss';

type ConfirmModalProps = {
	isVisible: boolean;
	cancelButtonLabel?: TranslateResult;
	confirmButtonLabel?: TranslateResult;
	text?: TranslateResult;
	title: string;
	onCancel: () => void;
	onConfirm: () => void;
};

const ConfirmModal = ( {
	isVisible,
	cancelButtonLabel,
	confirmButtonLabel,
	text,
	title,
	onCancel,
	onConfirm,
}: ConfirmModalProps ) => {
	const translate = useTranslate();
	const modalRef = useRef< HTMLDivElement >( null );
	const previousFocusRef = useRef< HTMLElement | null >( null );

	// Handle focus management
	useEffect( () => {
		if ( isVisible ) {
			const modal = modalRef.current;
			// Store the previously focused element
			previousFocusRef.current = document.activeElement as HTMLElement;

			// Focus the primary button when modal opens
			const primaryButton = modal?.querySelector(
				'button[type="button"].is-primary'
			) as HTMLElement;
			primaryButton?.focus();

			// Prevent focus from leaving the modal
			const handleFocusOut = ( event: FocusEvent ) => {
				if ( modal && ! modal.contains( event.relatedTarget as Node ) ) {
					primaryButton?.focus();
				}
			};

			modal?.addEventListener( 'focusout', handleFocusOut );
			return () => modal?.removeEventListener( 'focusout', handleFocusOut );
		} else if ( previousFocusRef.current ) {
			// Restore focus when modal closes
			requestAnimationFrame( () => previousFocusRef.current?.focus() );
		}
	}, [ isVisible ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal overlayClassName="confirm-modal" title={ title } onRequestClose={ onCancel }>
			<div ref={ modalRef }>
				{ text && <p className="confirm-modal__text">{ text }</p> }
				<div className="confirm-modal__buttons">
					<Button variant="tertiary" onClick={ onCancel }>
						{ cancelButtonLabel ?? translate( 'Cancel' ) }
					</Button>
					<Button onClick={ onConfirm } variant="primary">
						{ confirmButtonLabel ?? translate( 'Confirm' ) }
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmModal;
