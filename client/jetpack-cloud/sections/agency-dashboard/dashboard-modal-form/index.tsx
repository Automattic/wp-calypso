import clsx from 'clsx';
import DashboardModal, { DashboardModalProps } from '../dashboard-modal';

import './style.scss';

type Props = DashboardModalProps & {
	onSubmit: () => void;
};

export default function DashboardModalForm( {
	children,
	className,
	onClose,
	onSubmit,
	subtitle,
	title,
}: Props ) {
	const handleOnSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		onSubmit();
	};

	return (
		<DashboardModal
			shouldCloseOnClickOutside={ false }
			title={ title }
			subtitle={ subtitle }
			onClose={ onClose }
			className={ clsx( 'dashboard-modal-form', className ) }
		>
			<form onSubmit={ handleOnSubmit }>{ children }</form>
		</DashboardModal>
	);
}
