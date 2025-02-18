import { Button } from '@automattic/components';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode, forwardRef } from 'react';
import Modal from 'react-modal';

import './style.scss';

type ContainerProps = {
	children: ReactNode;
};

type JetpackLightboxProps = ContainerProps & {
	className?: string;
	isOpen: boolean;
	onAfterOpen?: () => void;
	onClose: () => void;
};

export const JetpackLightboxMain = forwardRef< HTMLDivElement, ContainerProps >(
	( { children }, ref ) => {
		return (
			<div className="jetpack-lightbox__content-main" ref={ ref }>
				{ children }
			</div>
		);
	}
);

export const JetpackLightboxAside = forwardRef< HTMLDivElement, ContainerProps >(
	( { children }, ref ) => {
		return (
			<div className="jetpack-lightbox__content-aside" ref={ ref }>
				{ children }
			</div>
		);
	}
);

export const JetpackLightboxFooter = forwardRef< HTMLDivElement, ContainerProps >(
	( { children }, ref ) => {
		return (
			<div className="jetpack-lightbox__content-footer" ref={ ref }>
				{ children }
			</div>
		);
	}
);

const JetpackLightbox: FunctionComponent< JetpackLightboxProps > = ( {
	children,
	className,
	isOpen,
	onAfterOpen,
	onClose,
} ) => {
	const translate = useTranslate();

	return (
		<Modal
			className={ clsx( 'jetpack-lightbox__modal', className ) }
			overlayClassName="jetpack-lightbox__modal-overlay"
			isOpen={ isOpen }
			onRequestClose={ onClose }
			onAfterOpen={ onAfterOpen }
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
