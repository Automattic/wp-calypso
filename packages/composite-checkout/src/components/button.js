/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function Button( {
	buttonState,
	buttonType,
	onClick,
	className,
	fullWidth,
	children,
} ) {
	return (
		<CallToAction
			buttonState={ buttonState }
			buttonType={ buttonType }
			padding={ buttonState === 'text-button' ? '0' : '10px 15px' }
			onClick={ onClick }
			className={ className }
			fullWidth={ fullWidth }
		>
			{ children }
		</CallToAction>
	);
}

Button.propTypes = {
	buttonState: PropTypes.string,
	buttonType: PropTypes.string,
	onClick: PropTypes.func,
	fullWidth: PropTypes.bool,
};

const CallToAction = styled.button`
	display: block;
	width: ${ props => ( props.fullWidth ? '100%' : 'auto' ) };
	font-size: 16px;
	border-radius: ${ props => ( props.buttonType === 'paypal' ? '50px' : '3px' ) };
	padding: ${ props => props.padding };
	background: ${ getBackgroundColor };
	border-width: ${ getBorderWeight };
	border-style: solid;
	border-color: ${ getBorderColor };
	color: ${ getTextColor };
	box-shadow: ${ getBoxShadow }
	font-weight: ${ getFontWeight };
	text-decoration: ${ getTextDecoration };

	:hover {
		cursor: pointer;
		background: ${ getRollOverColor };
		border-width: ${ getBorderWeight };
		border-style: solid;
		border-color: ${ getRollOverBorderColor };
		box-shadow: ${ getBoxShadowHover }
		text-decoration: none;
		color: ${ props =>
			props.buttonState === 'default' ? props.theme.colors.surface : getTextColor( props ) }
		cursor: ${ ( { buttonState } ) =>
			buttonState && buttonState.includes( 'disabled' ) ? 'not-allowed' : 'pointer' }
	}

	:active {
		background: ${ getBackgroundColor };
		border-width: ${ getBorderWeight };
		border-style: solid;
		border-color: ${ getBorderColor };
		box-shadow: ${ getBoxShadow }
		text-decoration: ${ getTextDecoration };
		color: ${ getTextColor };
	}

	img {
		margin-bottom: -1px;
		transform: translateY(2px);
		filter: ${ getImageFilter }
		opacity: ${ getImageOpacity };
	}
`;

function getImageFilter( { buttonType, buttonState } ) {
	return `grayscale( ${ buttonState && buttonState.includes( 'primary' ) ? 0 : 100 } ) invert( ${
		buttonState === 'primary' && buttonType === 'apple-pay' ? '100%' : 0
	} );`;
}

function getImageOpacity( { buttonState } ) {
	return buttonState && buttonState.includes( 'primary' ) ? 1 : '0.5';
}

function getBoxShadow( props ) {
	return `0 ${ getBorderWeight( props ) } 0 ${ getBorderColor( props ) }`;
}

function getBoxShadowHover( props ) {
	return `0 ${ getBorderWeight( props ) } 0 ${ getRollOverBorderColor( props ) }`;
}

function getBorderWeight( { buttonState } ) {
	return buttonState === 'text-button' ? '0' : '1px';
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
			return colors.highlight;
		case 'secondary':
			return colors.primary;
		case 'disabled':
			return colors.disabledPaymentButtons;
		case 'text-button':
			return 'none';
		default:
			return colors.highlight;
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
			return colors.highlightBorder;
		case 'secondary':
			return colors.primaryBorder;
		case 'disabled':
			if ( buttonType === 'paypal' ) {
				return colors.disabledPaymentButtons;
			}
			return colors.disabledButtons;
		default:
			return colors.highlightBorder;
	}
}

function getTextColor( { buttonState, theme } ) {
	const { colors } = theme;
	switch ( buttonState ) {
		case 'primary':
			return colors.surface;
		case 'secondary':
			return colors.surface;
		case 'disabled':
			return colors.disabledButtons;
		case 'text-button':
			return colors.highlight;
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
			if ( buttonType === 'paypal' || buttonType === 'apple-pay' ) {
				return colors.disabledPaymentButtons;
			}
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
