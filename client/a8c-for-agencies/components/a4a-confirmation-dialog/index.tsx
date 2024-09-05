import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { clsx } from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';

import './style.scss';

export type Props = {
	className?: string;
	title: string;
	children: ReactNode;
	onClose: () => void;
	onConfirm?: () => void;
	ctaLabel?: string;
	closeLabel?: string;
	isLoading?: boolean;
	isDestructive?: boolean;
};

export function A4AConfirmationDialog( {
	className,
	title,
	children,
	onConfirm,
	ctaLabel,
	closeLabel,
	onClose,
	isLoading,
	isDestructive,
}: Props ) {
	const translate = useTranslate();

	return (
		<Dialog
			label={ title }
			isVisible
			additionalClassNames={ clsx( 'a4a-confirmation-dialog', className ) }
			onClose={ onClose }
			buttons={ [
				<Button key="cancel-button" onClick={ onClose } disabled={ isLoading } variant="secondary">
					{ closeLabel ?? translate( 'Cancel' ) }
				</Button>,

				<Button
					key="confirmation-button"
					variant="primary"
					isDestructive={ isDestructive }
					isBusy={ isLoading }
					disabled={ isLoading }
					onClick={ onConfirm }
				>
					{ ctaLabel ?? translate( 'Confirm' ) }
				</Button>,
			] }
		>
			<h1 className="a4a-confirmation-dialog__heading">{ title }</h1>

			{ children }
		</Dialog>
	);
}
