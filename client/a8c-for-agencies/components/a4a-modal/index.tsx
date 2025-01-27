import { Modal, Button } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { clsx } from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function A4AModal( {
	onClose,
	children,
	extraActions,
	title,
	subtile,
	className,
}: {
	onClose: () => void;
	children: React.ReactNode;
	extraActions: React.ReactNode;
	title: string;
	subtile: string;
	className?: string;
} ) {
	const translate = useTranslate();

	return (
		<Modal
			onRequestClose={ onClose }
			className={ clsx( 'a4a-modal', className ) }
			__experimentalHideHeader
		>
			<div className="a4a-modal__main">
				<Button
					className="a4a-modal__close-button"
					onClick={ onClose }
					aria-label={ translate( 'Close' ) }
				>
					<Icon size={ 24 } icon={ close } />
				</Button>
				<div className="a4a-modal__title">{ title }</div>
				<div className="a4a-modal__subtitle">{ subtile }</div>
				{ children }
			</div>
			<div className="a4a-modal__footer">
				<Button variant="secondary" onClick={ onClose }>
					{ translate( 'Cancel' ) }
				</Button>
				{ extraActions }
			</div>
		</Modal>
	);
}
