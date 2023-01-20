import classnames from 'classnames';
import { useCallback } from 'react';
import Modal from 'react-modal';
import Gridicon from '../gridicon';
import ButtonBar from './button-bar';
import type { Button, BaseButton } from './button-bar';
import type { PropsWithChildren } from 'react';

import './style.scss';

type Props = {
	additionalClassNames?: Parameters< typeof classnames >[ 0 ];
	additionalOverlayClassNames?: Parameters< typeof classnames >[ 0 ];
	baseClassName?: string;
	buttons?: Button[];
	className?: string;
	isBackdropVisible?: boolean;
	isFullScreen?: boolean;
	isVisible: boolean;
	label?: string;
	leaveTimeout?: number;
	onClose: ( action?: string ) => void;
	shouldCloseOnEsc?: boolean;
	showCloseIcon?: boolean;
};

const Dialog = ( {
	additionalClassNames,
	additionalOverlayClassNames,
	buttons,
	baseClassName = 'dialog',
	className,
	children,
	isBackdropVisible = true,
	isFullScreen = true,
	isVisible = false,
	label = '',
	leaveTimeout = 200,
	onClose,
	shouldCloseOnEsc,
	showCloseIcon = false,
}: PropsWithChildren< Props > ) => {
	const close = useCallback( () => onClose?.(), [ onClose ] );
	const onButtonClick = useCallback(
		( button: BaseButton ) => {
			if ( button.onClick ) {
				button.onClick( () => onClose?.( button.action ) );
			} else {
				onClose?.( button.action );
			}
		},
		[ onClose ]
	);

	// Previous implementation used a `<Card />`, styling still relies on the 'card' class being present
	const dialogClassName = classnames( baseClassName, 'card', additionalClassNames );

	const backdropClassName = classnames( baseClassName + '__backdrop', additionalOverlayClassNames, {
		'is-full-screen': isFullScreen,
		'is-hidden': ! isBackdropVisible,
	} );

	const contentClassName = classnames( baseClassName + '__content', className );

	return (
		<Modal
			isOpen={ isVisible }
			onRequestClose={ close }
			closeTimeoutMS={ leaveTimeout }
			contentLabel={ label }
			overlayClassName={ backdropClassName } // We use flex here which react-modal doesn't
			className={ dialogClassName }
			htmlOpenClassName="ReactModal__Html--open"
			role="dialog"
			shouldCloseOnEsc={ shouldCloseOnEsc }
		>
			{ showCloseIcon && (
				<button className="dialog__action-buttons-close" onClick={ () => onClose( this ) }>
					<Gridicon icon="cross" size={ 24 } />
				</button>
			) }
			<div className={ contentClassName } tabIndex={ -1 }>
				{ children }
			</div>
			<ButtonBar
				buttons={ buttons }
				onButtonClick={ onButtonClick }
				baseClassName={ baseClassName }
			/>
		</Modal>
	);
};

export default Dialog;
