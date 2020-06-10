/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

/**
 * Internal Classes
 */
import joinClasses from '../lib/join-classes';

export default function Button( {
	className,
	buttonState,
	buttonType,
	isBusy,
	children,
	...props
} ) {
	const classNames = joinClasses( [
		'checkout-button',
		...( buttonState ? [ 'is-status-' + buttonState ] : [] ),
		...( buttonType ? [ 'is-type-' + buttonType ] : [] ),
		...( isBusy ? [ 'is-busy' ] : [] ),
		...( className ? [ className ] : [] ),
	] );

	return (
		<CallToAction
			buttonState={ buttonState }
			buttonType={ buttonType }
			isBusy={ isBusy }
			className={ classNames }
			{ ...props }
		>
			{ children }
		</CallToAction>
	);
}

Button.propTypes = {
	buttonState: PropTypes.oneOf( [ 'primary', 'secondary', 'text-button', 'borderless' ] ),
	buttonType: PropTypes.string, // Service type (i.e. 'paypal' or 'apple-pay').
	fullWidth: PropTypes.bool,
	isBusy: PropTypes.bool,
};

const CallToAction = styled.button`
	display: block;
	width: ${ ( props ) => ( props.fullWidth ? '100%' : 'auto' ) };
	font-size: 16px;
	border-radius: ${ ( props ) => ( props.buttonType === 'paypal' ? '50px' : '2px' ) };
	padding: ${ ( props ) => ( props.buttonState === 'text-button' ? '0' : '10px 15px' ) };
	border: ${ ( props ) =>
		props.buttonState === 'default' ? '1px solid ' + props.theme.colors.borderColor : '0' };
	background: ${ getBackgroundColor };
	color: ${ getTextColor };
	font-weight: ${ getFontWeight };
	text-decoration: ${ getTextDecoration };

	:hover {
		background: ${ getRollOverColor };
		border-color: ${ ( props ) =>
			props.buttonState === 'default' ? props.theme.colors.borderColorDark : 'transparent' };
		text-decoration: none;
		color: ${ getTextColor };
		cursor: ${ ( props ) => ( props.disabled ? 'not-allowed' : 'pointer' ) };
	}

	:active {
		background: ${ getRollOverColor };
		text-decoration: ${ getTextDecoration };
		color: ${ getTextColor };
	}

	svg {
		margin-bottom: -1px;
		transform: translateY( 2px );
		filter: ${ getImageFilter };
		opacity: ${ getImageOpacity };
	}

	&.is-busy {
		animation: components-button__busy-animation 2500ms infinite linear;
		background-image: linear-gradient(
			-45deg,
			${ getBackgroundColor } 28%,
			${ getBackgroundAccentColor } 28%,
			${ getBackgroundAccentColor } 72%,
			${ getBackgroundColor } 72%
		);
		background-size: 200px;
		opacity: 1;
	}

	@keyframes components-button__busy-animation {
		0% {
			background-position: 200px 0;
		}
	}
`;

function getImageFilter( { buttonType, buttonState } ) {
	return `grayscale( ${ buttonState === 'primary' ? '0' : '100' } ) invert( ${
		buttonState === 'primary' && buttonType === 'apple-pay' ? '100%' : '0'
	} );`;
}

function getImageOpacity( { buttonState } ) {
	return buttonState === 'primary' ? '1' : '0.5';
}

function getRollOverColor( { disabled, buttonState, buttonType, theme } ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtons;
	}
	switch ( buttonState ) {
		case 'primary':
			if ( buttonType === 'apple-pay' ) {
				return colors.applePayButtonRollOverColor;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGoldHover;
			}
			return colors.primaryOver;
		case 'secondary':
			return colors.highlightOver;
		case 'text-button':
		case 'borderless':
			return 'none';
		default:
			return 'none';
	}
}

function getTextColor( { disabled, buttonState, theme } ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledButtons;
	}
	switch ( buttonState ) {
		case 'primary':
			return colors.surface;
		case 'secondary':
			return colors.surface;
		case 'text-button':
			return colors.highlight;
		default:
			return colors.textColor;
	}
}

function getBackgroundColor( { disabled, buttonType, buttonState, theme } ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtons;
	}
	switch ( buttonState ) {
		case 'primary':
			if ( buttonType === 'apple-pay' ) {
				return colors.applePayButtonColor;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGold;
			}
			return colors.primary;
		case 'secondary':
			return colors.highlight;
		default:
			return 'none';
	}
}

function getBackgroundAccentColor( { disabled, buttonState, buttonType, theme } ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtonsAccent;
	}
	switch ( buttonState ) {
		case 'primary':
			if ( buttonType === 'apple-pay' ) {
				return colors.applePayButtonRollOverColor;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGoldHover;
			}
			return colors.primaryOver;
		case 'secondary':
			return colors.highlightOver;
		case 'text-button':
		case 'borderless':
			return 'none';
		default:
			return 'none';
	}
}

function getFontWeight( { disabled, buttonState, theme } ) {
	if ( disabled || buttonState === 'text-button' ) {
		return theme.weights.normal;
	}
	return theme.weights.bold;
}

function getTextDecoration( { buttonState } ) {
	return buttonState === 'text-button' ? 'underline' : 'none';
}
