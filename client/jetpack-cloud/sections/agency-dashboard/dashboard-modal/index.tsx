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
};

export default function DashboardModal( {
	children,
	className,
	onClose,
	subtitle,
	title,
}: DashboardModalProps ) {
	return (
		<Modal
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
