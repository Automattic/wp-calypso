import { Button } from '@automattic/components';
import { Icon, close } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';
import Modal from 'react-modal';

import './style.scss';

type ContainerProps = {
	children: ReactNode;
};

type JetpackLightboxProps = ContainerProps & {
	className?: string;
	isOpen: boolean;
	onClose: () => void;
};

export const JetpackLightboxMain: FunctionComponent< ContainerProps > = ( { children } ) => {
	return <div className="jetpack-lightbox__content-main">{ children }</div>;
};

export const JetpackLightboxAside: FunctionComponent< ContainerProps > = ( { children } ) => {
	return <div className="jetpack-lightbox__content-aside">{ children }</div>;
};

const JetpackLightbox: FunctionComponent< JetpackLightboxProps > = ( {
	children,
	className,
	isOpen,
	onClose,
} ) => {
	const translate = useTranslate();

	return (
		<Modal
			className={ classNames( 'jetpack-lightbox__modal', className ) }
			overlayClassName="jetpack-lightbox__modal-overlay"
			isOpen={ isOpen }
			onRequestClose={ onClose }
			htmlOpenClassName="jetpack-lightbox__html--is-open lightbox-mode"
		>
			<div className="jetpack-lightbox__content-wrapper">
				<Button
					className="jetpack-lightbox__close-button"
					plain
					onClick={ onClose }
					aria-label={
						translate( 'Close', {
							comment:
								'Text read by screen readers when the close button of the lightbox gets focus.',
						} ) as string
					}
				>
					<Icon size={ 24 } icon={ close } />
				</Button>

				{ children }
			</div>
		</Modal>
	);
};

export default JetpackLightbox;
