import { Modal } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

export type DashboardModalProps = {
	children: ReactNode;
	className?: string;
	onClose: () => void;
	subtitle?: ReactNode;
	title: string;
	shouldCloseOnClickOutside?: boolean;
};

export default function DashboardModal( {
	children,
	className,
	onClose,
	subtitle,
	title,
	shouldCloseOnClickOutside = true,
}: DashboardModalProps ) {
	return (
		<Modal
			shouldCloseOnClickOutside={ shouldCloseOnClickOutside }
			onRequestClose={ onClose }
			title={ title }
			className={ clsx( 'dashboard-modal', className ) }
		>
			<div className="dashboard-modal__sub-title">{ subtitle }</div>
			{ children }
		</Modal>
	);
}
