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
	buttonState: PropTypes.string, // Either 'disabled', 'primary', 'secondary', 'text-button', 'borderless'.
	buttonType: PropTypes.string, // Service type (i.e. 'paypal' or 'apple-pay').
	fullWidth: PropTypes.bool,
	onClick: PropTypes.func,
	isBusy: PropTypes.bool,
};

const CallToAction = styled.button`
	display: block;
	width: ${( props ) => ( props.fullWidth ? '100%' : 'auto') };
	font-size: 16px;
	border-radius: ${( props ) => ( props.buttonType === 'paypal' ? '50px' : '3px') };
	padding: ${( props ) => ( props.buttonState === 'text-button' ? '0' : '10px 15px') };
	background: ${getBackgroundColor};
	border-width: ${getBorderWeight};
	border-style: solid;
	border-color: ${getBorderColor};
	color: ${getTextColor};
	border-bottom-width: ${getBorderElevationWeight};
	font-weight: ${getFontWeight};
	text-decoration: ${getTextDecoration};

	:hover {
		background: ${getRollOverColor};
		border-width: ${getBorderWeight};
		border-style: solid;
		border-color: ${getRollOverBorderColor};
		border-bottom-width: ${getBorderElevationWeight};
		text-decoration: none;
		color: ${getTextColor};
		cursor: ${( props ) => ( props.buttonState === 'disabled' ? 'not-allowed' : 'pointer') };
	}

	:active {
		background: ${getRollOverColor};
		border-width: ${getBorderWeight};
		border-style: solid;
		border-color: ${getRollOverBorderColor};
		border-top-width: ${getBorderElevationWeight};
		text-decoration: ${getTextDecoration};
		color: ${getTextColor};
	}

	svg {
		margin-bottom: -1px;
		transform: translateY( 2px );
		filter: ${getImageFilter};
		opacity: ${getImageOpacity};
	}

	&.is-busy {
		animation: components-button__busy-animation 2500ms infinite linear;
		background-image: linear-gradient(
			-45deg,
			${getBackgroundColor} 28%,
			${getBackgroundAccentColor} 28%,
			${getBackgroundAccentColor} 72%,
			${getBackgroundColor} 72%
		);
		background-size: 200px;
		border-color: ${getRollOverBorderColor};
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

function getBorderWeight( { buttonState } ) {
	return buttonState === 'text-button' || buttonState === 'borderless' ? '0' : '1px';
}

function getBorderElevationWeight( { buttonState } ) {
	return buttonState === 'text-button' || buttonState === 'borderless' ? '0' : '2px';
}

function getRollOverColor( { buttonState, buttonType, theme } ) {
	const { colors } = theme;
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
		case 'disabled':
			return colors.disabledPaymentButtons;
		case 'text-button':
		case 'borderless':
			return 'none';
		default:
			return 'none';
	}
}

function getRollOverBorderColor( { buttonState, buttonType, theme } ) {
	const { colors } = theme;
	switch ( buttonState ) {
		case 'primary':
			if ( buttonType === 'apple-pay' ) {
				return colors.applePayButtonRollOverColor;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGoldHover;
			}
			return colors.primaryBorder;
		case 'secondary':
			return colors.highlightBorder;
		case 'disabled':
			return colors.disabledButtons;
		default:
			return colors.borderColorDark;
	}
}

function getTextColor( { buttonState, theme } ) {
	const { colors } = theme;
	switch ( buttonState ) {
		case 'primary':
			return colors.surface;
		case 'secondary':
			return colors.surface;
		case 'text-button':
			return colors.highlight;
		case 'disabled':
			return colors.disabledButtons;
		default:
			return colors.textColor;
	}
}

function getBackgroundColor( { buttonType, buttonState, theme } ) {
	const { colors } = theme;
	switch ( buttonState ) {
		case 'primary':
			if ( buttonType === 'apple-pay' ) {
				return colors.applePayButtonColor;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGold;
			}
			return colors.primary;
		case 'disabled':
			return colors.disabledPaymentButtons;
		case 'secondary':
			return colors.highlight;
		default:
			return 'none';
	}
}

function getBackgroundAccentColor( { buttonState, buttonType, theme } ) {
	const { colors } = theme;
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
		case 'disabled':
			return colors.disabledPaymentButtonsAccent;
		case 'text-button':
		case 'borderless':
			return 'none';
		default:
			return 'none';
	}
}

function getBorderColor( { buttonType, buttonState, theme } ) {
	const { colors } = theme;
	switch ( buttonState ) {
		case 'primary':
			if ( buttonType === 'apple-pay' ) {
				return colors.applePayButtonColor;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGold;
			}
			return colors.primaryBorder;
		case 'secondary':
			return colors.highlightBorder;
		case 'disabled':
			return colors.disabledButtons;
		default:
			return colors.borderColor;
	}
}

function getFontWeight( { buttonState, theme } ) {
	if ( buttonState === 'disabled' || buttonState === 'text-button' ) {
		return theme.weights.normal;
	}
	return theme.weights.bold;
}

function getTextDecoration( { buttonState } ) {
	return buttonState === 'text-button' ? 'underline' : 'none';
}
