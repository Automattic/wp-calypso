import { Button } from '@wordpress/components';
import React, { useEffect } from 'react';
import './style.scss';

// DELETE ME ONCE https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-confirmdialog--docs is live.
// At this date, WP's Dialog is sadly broken.
interface ConfirmationDialogProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	confirmButtonText: string;
	cancelButtonText: string;
	children: React.ReactNode;
}

export function ConfirmationDialog( {
	isOpen,
	onConfirm,
	onCancel,
	confirmButtonText,
	cancelButtonText,
	children,
}: ConfirmationDialogProps ) {
	const dialogRef = React.useRef< HTMLDialogElement >( null );
	useEffect( () => {
		const dialog = dialogRef.current;
		if ( dialog ) {
			if ( isOpen ) {
				dialog.showModal();
			} else {
				dialog.close();
			}
		}
	}, [ isOpen, dialogRef ] );
	return (
		<dialog ref={ dialogRef } className="automattic-components-dialog" open>
			<div>{ children }</div>
			<div className="automattic-components-dialog__actions">
				<Button variant="link" onClick={ onCancel }>
					{ cancelButtonText }
				</Button>
				{ /* eslint-disable-next-line jsx-a11y/no-autofocus */ }
				<Button variant="primary" onClick={ onConfirm } autoFocus={ isOpen }>
					{ confirmButtonText }
				</Button>
			</div>
		</dialog>
	);
}
