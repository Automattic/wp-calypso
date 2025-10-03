import { Button, Modal } from '@wordpress/components';
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

/**
 * @deprecated Use ConfirmDialog instead to follow the new design system
 */
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

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal overlayClassName="confirm-modal" title={ title } onRequestClose={ onCancel }>
			{ text && <p className="confirm-modal__text">{ text }</p> }
			<div className="confirm-modal__buttons">
				<Button variant="tertiary" onClick={ onCancel }>
					{ cancelButtonLabel ?? translate( 'Cancel' ) }
				</Button>
				<Button onClick={ onConfirm } variant="primary">
					{ confirmButtonLabel ?? translate( 'Confirm' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default ConfirmModal;
