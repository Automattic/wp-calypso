/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { keyframes } from '@emotion/core';
import PropTypes from 'prop-types';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import Button from './button';
import styled from '../lib/styled';

export default function CheckoutModal( {
	className,
	title,
	copy,
	primaryAction,
	cancelAction = noop,
	closeModal,
	isVisible,
	buttonCTA,
	cancelButtonCTA,
}: CheckoutModalProps ) {
	const { __ } = useI18n();
	useModalScreen( isVisible, closeModal );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<CheckoutModalWrapper
			className={ joinClasses( [ className, 'checkout-modal' ] ) }
			onClick={ () => handleCancelAction( cancelAction, closeModal ) }
		>
			<CheckoutModalContent className="checkout-modal__content" onClick={ preventClose }>
				<CheckoutModalTitle className="checkout-modal__title">{ title }</CheckoutModalTitle>
				<CheckoutModalCopy className="checkout-modal__copy">{ copy }</CheckoutModalCopy>

				<CheckoutModalActions>
					<Button onClick={ () => handleCancelAction( cancelAction, closeModal ) }>
						{ cancelButtonCTA || __( 'Cancel' ) }
					</Button>
					<Button
						buttonType="primary"
						onClick={ () => {
							handlePrimaryAction( primaryAction, closeModal );
						} }
					>
						{ buttonCTA || __( 'Continue' ) }
					</Button>
				</CheckoutModalActions>
			</CheckoutModalContent>
		</CheckoutModalWrapper>
	);
}

CheckoutModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	copy: PropTypes.string.isRequired,
	primaryAction: PropTypes.func.isRequired,
	cancelAction: PropTypes.func,
	isVisible: PropTypes.bool.isRequired,
	className: PropTypes.string,
	buttonCTA: PropTypes.string,
	cancelButtonCTA: PropTypes.string,
};

type Callback = () => void;

interface CheckoutModalProps {
	closeModal: Callback;
	title: string;
	copy: string;
	primaryAction: Callback;
	cancelAction?: Callback;
	isVisible: boolean;
	className?: string;
	buttonCTA?: string;
	cancelButtonCTA?: string;
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
	width: 100%;
	max-width: 350px;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 32px;
	animation: ${ animateIn } 0.2s 0.1s ease-out;
	animation-fill-mode: backwards;
`;

const CheckoutModalTitle = styled.h1`
	margin: 0 0 16px;
	font-weight: ${ ( props ) => props.theme.weights.normal };
	font-size: 24px;
	color: ${ ( props ) => props.theme.colors.textColor };
	line-height: 1.3;
`;

const CheckoutModalCopy = styled.p`
	margin: 0;
`;

const CheckoutModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-top: 24px;

	button:first-of-type {
		margin-right: 8px;

		.rtl & {
			margin-right: 0;
			margin-left: 8px;
		}
	}
`;

function handlePrimaryAction( primaryAction: Callback, closeModal: Callback ) {
	primaryAction();
	closeModal();
}

function handleCancelAction( cancelAction: Callback, closeModal: Callback ) {
	cancelAction();
	closeModal();
}

function preventClose( event: React.MouseEvent< HTMLDivElement, MouseEvent > ) {
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
