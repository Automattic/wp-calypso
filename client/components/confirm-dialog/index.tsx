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

type ConfirmDialogProps = ComponentProps< typeof Modal >;

export const ConfirmDialog = ( { children, className, ...modalProps }: ConfirmDialogProps ) => {
	return (
		<Modal className={ clsx( 'confirm-dialog', className ) } { ...modalProps }>
			{ children }
		</Modal>
	);
};
