import { hasCheckoutVersion } from '@automattic/wpcom-checkout';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import joinClasses from '../lib/join-classes';
import Button from './button';
import type { MouseEvent } from 'react';

/* eslint-disable @typescript-eslint/no-use-before-define */

export default function CheckoutModal( {
	className,
	title,
	copy,
	primaryAction,
	secondaryAction,
	cancelAction = noop,
	closeModal,
	isVisible,
	primaryButtonCTA,
	secondaryButtonCTA,
}: CheckoutModalProps ) {
	const { __ } = useI18n();
	useModalScreen( isVisible, closeModal );

	if ( ! isVisible ) {
		return null;
	}

	const titleId = `${ String( title )
		.toLowerCase()
		.replace( /[^a-z0-9_-]/g, '-' ) }-modal-title`;

	return (
		<CheckoutModalWrapper
			role="dialog"
			aria-labelledby={ titleId }
			className={ joinClasses( [ className, 'checkout-modal' ] ) }
			onClick={ () => handleActionAndClose( cancelAction, closeModal ) }
		>
			<CheckoutModalContent className="checkout-modal__content" onClick={ preventClose }>
				<CheckoutModalTitle id={ titleId } className="checkout-modal__title">
					{ title }
				</CheckoutModalTitle>
				<CheckoutModalCopy className="checkout-modal__copy">{ copy }</CheckoutModalCopy>

				<CheckoutModalActions>
					{ secondaryAction && secondaryButtonCTA && (
						<Button
							onClick={ () => {
								handleActionAndClose( secondaryAction, closeModal );
							} }
						>
							{ secondaryButtonCTA }
						</Button>
					) }
					<Button
						buttonType="primary"
						onClick={ () => {
							handleActionAndClose( primaryAction, closeModal );
						} }
					>
						{ primaryButtonCTA || __( 'Continue' ) }
					</Button>
				</CheckoutModalActions>
			</CheckoutModalContent>
		</CheckoutModalWrapper>
	);
}

type Callback = () => void;

interface CheckoutModalProps {
	closeModal: Callback;
	title: React.ReactNode;
	copy: React.ReactNode;
	primaryAction: Callback;
	secondaryAction?: Callback;
	cancelAction?: Callback;
	isVisible: boolean;
	className?: string;
	primaryButtonCTA?: React.ReactNode;
	secondaryButtonCTA?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const animateIn = keyframes`
  from {
    opacity: 0;
    transform: scale(1.05);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const CheckoutModalWrapper = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	background: ${ ( props ) => props.theme.colors.modalBackground };
	width: 100%;
	height: 100vh;
	z-index: 999;
	display: flex;
	justify-content: center;
	align-items: center;
	animation: ${ fadeIn } 0.2s ease-out;
	animation-fill-mode: backwards;
	box-sizing: border-box;
	margin: 0;
	padding: 0;

	.rtl & {
		right: 0;
		left: auto;
	}
`;

const CheckoutModalContent = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	display: block;
	font-size: ${ hasCheckoutVersion( '2' ) ? '16px' : null };
	line-height: ${ hasCheckoutVersion( '2' ) ? '1.5em' : null };
	width: 100%;
	max-width: 350px;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	border-radius: ${ hasCheckoutVersion( '2' ) ? '2px' : null };
	padding: 32px;
	animation: ${ animateIn } 0.2s 0.1s ease-out;
	animation-fill-mode: backwards;
`;

const CheckoutModalTitle = styled.h1`
	margin: 0 0 16px;
	font-weight: ${ ( props ) => props.theme.weights.normal };
	font-size: ${ hasCheckoutVersion( '2' ) ? '20px' : '24px' };
	color: ${ ( props ) => props.theme.colors.textColor };
	line-height: ${ hasCheckoutVersion( '2' ) ? '1.5' : '1.3' };
`;

const CheckoutModalCopy = styled.p`
	margin: 0;
	color: ${ ( props ) => props.theme.colors.textColor };
`;

const CheckoutModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	margin-top: 24px;
`;

function handleActionAndClose( action: Callback, closeModal: Callback ) {
	action();
	closeModal();
}

function preventClose( event: MouseEvent< HTMLDivElement > ) {
	event.stopPropagation();
}

function useModalScreen( isVisible: boolean, closeModal: Callback ) {
	useEffect( () => {
		document.body.style.cssText = isVisible ? 'overflow: hidden' : '';
		const keyPressHandler = makeHandleKeyPress( closeModal );
		if ( isVisible ) {
			document.addEventListener( 'keydown', keyPressHandler, false );
		}
		return () => {
			document.body.style.cssText = '';
			document.removeEventListener( 'keydown', keyPressHandler, false );
		};
	}, [ isVisible, closeModal ] );
}

function makeHandleKeyPress( closeModal: Callback ) {
	const escapeKey = 27;
	return ( key: { keyCode: number } ) => {
		if ( key.keyCode === escapeKey ) {
			closeModal();
		}
	};
}
