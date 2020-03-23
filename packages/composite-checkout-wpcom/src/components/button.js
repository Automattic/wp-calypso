/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

export default function Button( {
	buttonState,
	buttonType,
	onClick,
	className,
	fullWidth,
	children,
	...props
} ) {
	return (
		<CallToAction
			buttonState={ buttonState }
			buttonType={ buttonType }
			padding={ buttonState === 'text-button' ? '0' : '10px 15px' }
			onClick={ onClick }
			className={ className }
			fullWidth={ fullWidth }
			{ ...props }
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
	border-bottom-width: ${ getBorderElevationWeight };
	font-weight: ${ getFontWeight };
	text-decoration: ${ getTextDecoration };

	:hover {
		cursor: pointer;
		background: ${ getRollOverColor };
		border-width: ${ getBorderWeight };
		border-style: solid;
		border-color: ${ getRollOverBorderColor };
		border-bottom-width: ${ getBorderElevationWeight };
		text-decoration: none;
		color: ${ getTextColor };
		cursor: ${ ( { buttonState } ) =>
			buttonState && buttonState.includes( 'disabled' ) ? 'not-allowed' : 'pointer' };
	}

	:active {
		background: ${ getRollOverColor };
		border-width: ${ getBorderWeight };
		border-style: solid;
		border-color: ${ getRollOverBorderColor };
		border-top-width: ${ getBorderElevationWeight };
		text-decoration: ${ getTextDecoration };
		color: ${ getTextColor };
	}

	svg {
		margin-bottom: -1px;
		transform: translateY(2px);
		filter: ${ getImageFilter }
		opacity: ${ getImageOpacity };
	}
`;

function getImageFilter( { buttonType, buttonState } ) {
	return `grayscale( ${ buttonState === 'disabled' ? 100 : 0 } ) invert( ${
		buttonState === 'primary' && buttonType === 'apple-pay' ? '100%' : 0
	} );`;
}

function getImageOpacity( { buttonState } ) {
	return buttonState === 'disabled' ? 0.5 : '1';
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
			return 'none';
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
