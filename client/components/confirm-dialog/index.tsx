import { Modal } from '@wordpress/components';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import './style.scss';

interface DialogFooterProps {
	children: React.ReactNode;
}

export const DialogFooter = ( { children }: DialogFooterProps ) => {
	return <div className="confirm-dialog__footer">{ children }</div>;
};

interface DialogContentProps {
	children: React.ReactNode;
}

export const DialogContent = ( { children }: DialogContentProps ) => {
	return <div className="confirm-dialog__content">{ children }</div>;
};

interface ConfirmDialogProps {
	onRequestClose: ComponentProps< typeof Modal >[ 'onRequestClose' ];
	children: React.ReactNode;
	title: string;
	style?: React.CSSProperties;
	className?: string;
}

export const ConfirmDialog = ( {
	onRequestClose,
	children,
	title,
	style,
	className,
}: ConfirmDialogProps ) => {
	return (
		<Modal
			className={ clsx( 'confirm-dialog', className ) }
			onRequestClose={ onRequestClose }
			title={ title }
			style={ style }
		>
			{ children }
		</Modal>
	);
};
