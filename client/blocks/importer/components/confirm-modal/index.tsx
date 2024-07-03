import { Button } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import React from 'react';

import './style.scss';

interface Props {
	compact?: boolean;
	title?: string;
	children?: React.ReactNode;
	cancelText?: string;
	confirmText?: string;
	onClose?: () => void;
	onConfirm?: () => void;
}

const ConfirmModal: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const {
		compact = true,
		title = __( 'Confirm your choice' ),
		children,
		cancelText = __( 'Cancel' ),
		confirmText = __( 'Continue' ),
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose = () => {},
		onConfirm,
	} = props;

	return (
		<Modal
			className={ clsx( 'components-modal-new__frame', 'import__confirm-modal', {
				compact: compact,
			} ) }
			title={ title }
			onRequestClose={ onClose }
		>
			{ children }
			<div className="components-modal__button-actions">
				{ compact && <div className="components-modal__divider" /> }
				<Button className="action-buttons__cancel" onClick={ onClose }>
					{ cancelText }
				</Button>
				{ onConfirm && <NextButton onClick={ onConfirm }>{ confirmText }</NextButton> }
			</div>
		</Modal>
	);
};

export default ConfirmModal;
