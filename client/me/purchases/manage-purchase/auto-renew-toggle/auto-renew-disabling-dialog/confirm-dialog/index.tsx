import { Modal } from '@wordpress/components';
import { ComponentProps } from 'react';
import './style.scss';

interface DialogFooterProps {
	children: React.ReactNode;
}

export const DialogFooter = ( { children }: DialogFooterProps ) => {
	return <div className="auto-renew-confirm-dialog__footer">{ children }</div>;
};

interface DialogContentProps {
	children: React.ReactNode;
}

export const DialogContent = ( { children }: DialogContentProps ) => {
	return <div className="auto-renew-confirm-dialog__content">{ children }</div>;
};

interface ConfirmDialogProps {
	onRequestClose: ComponentProps< typeof Modal >[ 'onRequestClose' ];
	children: React.ReactNode;
	title: string;
}

export const ConfirmDialog = ( { onRequestClose, children, title }: ConfirmDialogProps ) => {
	return (
		<Modal className="auto-renew-confirm-dialog" onRequestClose={ onRequestClose } title={ title }>
			{ children }
		</Modal>
	);
};
