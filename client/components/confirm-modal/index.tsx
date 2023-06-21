import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import './styles.scss';
import { TranslateResult, useTranslate } from 'i18n-calypso';

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

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal overlayClassName="confirm-modal" title={ title } onRequestClose={ onCancel }>
			{ text && <p>{ text }</p> }
			<div className="confirm-modal__buttons">
				<Button className="confirm-modal__cancel" onClick={ onCancel }>
					{ cancelButtonLabel ?? translate( 'Cancel' ) }
				</Button>
				<Button onClick={ onConfirm } primary>
					{ confirmButtonLabel ?? translate( 'Confirm' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default ConfirmModal;
