/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
			props.buttonState === 'default' ? props.theme.color.white : getTextColor( props ) }
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
				return colors.gray80;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGoldHover;
			}
			return colors.highlight;
		case 'secondary':
			return colors.primary;
		case 'disabled':
			return colors.gray0;
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
				return colors.gray80;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGoldHover;
			}
			return colors.blue80;
		case 'secondary':
			return colors.pink70;
		case 'disabled':
			if ( buttonType === 'paypal' ) {
				return colors.gray0;
			}
			return colors.gray20;
		default:
			return colors.blue80;
	}
}

function getTextColor( { buttonState, theme } ) {
	const { colors } = theme;
	switch ( buttonState ) {
		case 'primary':
			return colors.white;
		case 'secondary':
			return colors.white;
		case 'disabled':
			return colors.gray20;
		default:
			return colors.highlight;
	}
}

function getBackgroundColor( { buttonType, buttonState, theme } ) {
	const { colors } = theme;
	switch ( buttonState ) {
		case 'primary':
			if ( buttonType === 'apple-pay' ) {
				return colors.black;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGold;
			}
			return colors.primary;
		case 'disabled':
			return colors.gray0;
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
				return colors.black;
			}
			if ( buttonType === 'paypal' ) {
				return colors.paypalGold;
			}
			return colors.pink70;
		case 'secondary':
			return colors.blue80;
		case 'disabled':
			if ( buttonType === 'paypal' || buttonType === 'apple-pay' ) {
				return colors.gray0;
			}
			return colors.gray20;
		default:
			return colors.highlight;
	}
}

function getFontWeight( { buttonState, theme } ) {
	if ( buttonState === 'disabled' || buttonState === 'text-button' ) {
		return theme.weights.normal;
	}
	return theme.bold;
}

function getTextDecoration( { buttonState } ) {
	return buttonState === 'text-button' ? 'underline' : 'none';
}

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
	onClick: PropTypes.func.isRequired,
	fullWidth: PropTypes.bool,
};
