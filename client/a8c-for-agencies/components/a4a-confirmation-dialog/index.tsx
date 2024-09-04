import { Button, Dialog } from '@automattic/components';
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
	busy?: boolean;
	scary?: boolean;
};

export function A4AConfirmationDialog( {
	className,
	title,
	children,
	onConfirm,
	ctaLabel,
	closeLabel,
	onClose,
	busy,
	scary,
}: Props ) {
	const translate = useTranslate();

	return (
		<Dialog
			label={ title }
			isVisible
			additionalClassNames={ clsx( 'a4a-confirmation-dialog', className ) }
			onClose={ onClose }
			buttons={ [
				<Button key="cancel-button" onClick={ onClose } disabled={ busy }>
					{ closeLabel ?? translate( 'Cancel' ) }
				</Button>,

				<Button
					key="confirmation-button"
					primary
					scary={ scary }
					disabled={ busy }
					busy={ busy }
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
