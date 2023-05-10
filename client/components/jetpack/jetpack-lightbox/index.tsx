import { Button } from '@automattic/components';
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

const CloseIcon = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M5.40456 5L19 19M5 19L18.5954 5" stroke="#1E1E1E" strokeWidth="1.5" />
	</svg>
);

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
			htmlOpenClassName="ReactModal__Html--open lightbox-mode"
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
					{ CloseIcon }
				</Button>

				{ children }
			</div>
		</Modal>
	);
};

export default JetpackLightbox;
