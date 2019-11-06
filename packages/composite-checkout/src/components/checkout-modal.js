/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import Button from './button';
import { useLocalize } from '../lib/localize';

export default function CheckoutModal( {
	className,
	title,
	copy,
	primaryAction,
	closeModal,
	isVisible,
	buttonCTA,
	cancelButtonCTA,
} ) {
	const localize = useLocalize();
	useEffect( () => {
		if ( isVisible ) {
			document.body.style = 'overflow: hidden';
			document.addEventListener(
				'keydown',
				key => {
					handleKeyPress( key, closeModal );
				},
				false
			);

			return;
		}

		document.body.style = 'overflow: scroll';
	} );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<CheckoutModalWrapper
			className={ joinClasses( [ className, 'checkout-modal' ] ) }
			onClick={ closeModal }
		>
			<CheckoutModalContent className="checkout-modal__content" onClick={ preventClose }>
				<CheckoutModalTitle className="checkout-modal__title">{ title }</CheckoutModalTitle>
				<CheckoutModalCopy className="checkout-modal__copy">{ copy }</CheckoutModalCopy>

				<CheckoutModalActions>
					<Button buttonState="default" onClick={ closeModal }>
						{ cancelButtonCTA || localize( 'Cancel' ) }
					</Button>
					<Button
						buttonState="primary"
						onClick={ () => {
							handlePrimaryAction( primaryAction, closeModal );
						} }
					>
						{ buttonCTA || localize( 'Continue' ) }
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
	isVisible: PropTypes.bool.isRequired,
	className: PropTypes.string,
	buttonCTA: PropTypes.string,
	cancelButtonCTA: PropTypes.string,
};

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
    transform: scale(1.08);
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
	background: ${props => props.theme.colors.modalBackground};
	width: 100%;
	height: 100vh;
	z-index: 999;
	display: flex;
	justify-content: center;
	align-items: center;
	animation: ${fadeIn} 0.2s ease-out;
	animation-fill-mode: backwards;
	box-sizing: border-box;
	margin: 0;
	padding: 0;
`;

const CheckoutModalContent = styled.div`
	background: ${props => props.theme.colors.surface};
	display: block;
	width: 100%;
	max-width: 300px;
	padding: 32px;
	animation: ${animateIn} 0.2s 0.1s ease-out;
	animation-fill-mode: backwards;
`;

const CheckoutModalTitle = styled.h1`
	margin: 0 0 16px;
	font-weight: ${props => props.theme.weights.normal};
	font-size: 24px;
	color: ${props => props.theme.colors.textColor};
`;

const CheckoutModalCopy = styled.p`
	margin: 0;
`;

const CheckoutModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-top: 24px;

	button:first-child {
		margin-right: 8px;
	}
`;

function handlePrimaryAction( primaryAction, closeModal ) {
	primaryAction();
	closeModal();
}

function preventClose( event ) {
	event.stopPropagation();
}

function handleKeyPress( key, closeModal ) {
	if ( key.keyCode === 27 ) {
		closeModal();
	}
}
