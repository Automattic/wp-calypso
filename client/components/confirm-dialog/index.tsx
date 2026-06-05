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
	size?: ComponentProps< typeof Modal >[ 'size' ];
	style?: React.CSSProperties;
	className?: string;
}

export const ConfirmDialog = ( {
	onRequestClose,
	children,
	title,
	size,
	style,
	className,
}: ConfirmDialogProps ) => {
	return (
		<Modal
			className={ clsx( 'confirm-dialog', className ) }
			onRequestClose={ onRequestClose }
			title={ title }
			size={ size }
			style={ style }
		>
			{ children }
		</Modal>
	);
};
