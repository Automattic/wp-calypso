import { Modal } from '@wordpress/components';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import './style.scss';

interface DialogFooterProps {
	children: React.ReactNode;
	className?: string;
}

export const DialogFooter = ( { children, className }: DialogFooterProps ) => {
	return <div className={ clsx( 'confirm-dialog__footer', className ) }>{ children }</div>;
};

interface DialogContentProps {
	children: React.ReactNode;
	className?: string;
}

export const DialogContent = ( { children, className }: DialogContentProps ) => {
	return <div className={ clsx( 'confirm-dialog__content', className ) }>{ children }</div>;
};

interface ConfirmDialogProps {
	onRequestClose: ComponentProps< typeof Modal >[ 'onRequestClose' ];
	children: React.ReactNode;
	title?: string;
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
