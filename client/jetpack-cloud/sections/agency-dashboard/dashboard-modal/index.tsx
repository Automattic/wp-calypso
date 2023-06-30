import { Modal } from '@wordpress/components';
import classNames from 'classnames';
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
			open={ true }
			onRequestClose={ onClose }
			title={ title }
			className={ classNames( 'dashboard-modal', className ) }
		>
			<div className="dashboard-modal__sub-title">{ subtitle }</div>
			{ children }
		</Modal>
	);
}
