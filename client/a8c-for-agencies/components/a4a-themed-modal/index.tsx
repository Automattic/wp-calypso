import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	children: ReactNode;
	onClose?: () => void;
	sidebarImage?: string;
	dismissable?: boolean;
};

export default function A4AThemedModal( {
	children,
	onClose = () => {},
	sidebarImage,
	dismissable,
}: Props ) {
	return (
		<Modal className="a4a-themed-modal" onRequestClose={ onClose } __experimentalHideHeader>
			<div className="a4a-themed-modal__wrapper">
				<img className="a4a-themed-modal__sidebar-image" src={ sidebarImage } alt="" />
				<div className="a4a-themed-modal__content">
					{ dismissable && (
						<Button className="a4a-themed-modal__dismiss-button" onClick={ onClose } plain>
							<Icon icon={ close } size={ 24 } />
						</Button>
					) }

					{ children }
				</div>
			</div>
		</Modal>
	);
}
