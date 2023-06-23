import classNames from 'classnames';
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
			title={ title }
			subtitle={ subtitle }
			onClose={ onClose }
			className={ classNames( 'dashboard-modal-form', className ) }
		>
			<form onSubmit={ handleOnSubmit }>{ children }</form>
		</DashboardModal>
	);
}
