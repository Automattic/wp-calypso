/**
 * External dependencies
 */
import React from 'react';
import type { ReactNode } from 'react';
import Modal from 'react-modal';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ButtonBar from './button-bar';
import type { Button, BaseButton } from './button-bar';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	additionalClassNames?: Parameters< typeof classnames >[ 0 ];
	baseClassName?: string;
	buttons?: Button[];
	className?: string;
	children: ReactNode;
	isBackdropVisible?: boolean;
	isFullScreen?: boolean;
	isVisible: boolean;
	label?: string;
	leaveTimeout?: number;
	onClose: ( action?: string ) => void;
	shouldCloseOnEsc?: boolean;
};

const Dialog = ( {
	additionalClassNames,
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
}: Props ): JSX.Element => {
	const close = React.useCallback( () => onClose?.(), [ onClose ] );
	const onButtonClick = React.useCallback(
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

	const backdropClassName = classnames( baseClassName + '__backdrop', {
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
