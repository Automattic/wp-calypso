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

export default function Button( { className, buttonState, isBusy, children, ...props } ) {
	const classNames = joinClasses( [
		'checkout-button',
		...( buttonState ? [ 'is-status-' + buttonState ] : [] ),
		...( isBusy ? [ 'is-busy' ] : [] ),
		...( className ? [ className ] : [] ),
	] );

	return (
		<CallToAction
			buttonState={ buttonState }
			isBusy={ isBusy }
			className={ classNames }
			{ ...props }
		>
			{ children }
		</CallToAction>
	);
}

Button.propTypes = {
	buttonState: PropTypes.oneOf( [ 'primary', 'secondary', 'text-button', 'borderless', 'paypal' ] ),
	fullWidth: PropTypes.bool,
	isBusy: PropTypes.bool,
};

const CallToAction = styled.button`
	display: block;
	width: ${ ( props ) => ( props.fullWidth ? '100%' : 'auto' ) };
	font-size: 16px;
	border-radius: ${ ( props ) => ( props.buttonState === 'paypal' ? '50px' : '2px' ) };
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

function getImageFilter( { buttonState } ) {
	return `grayscale( ${
		buttonState === 'primary' || buttonState === 'paypal' ? '0' : '100'
	} ) invert( 0 );`;
}

function getImageOpacity( { buttonState } ) {
	return buttonState === 'primary' || buttonState === 'paypal' ? '1' : '0.5';
}

function getRollOverColor( { disabled, buttonState, theme } ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtons;
	}
	switch ( buttonState ) {
		case 'paypal':
			return colors.paypalGoldHover;
		case 'primary':
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

function getBackgroundColor( { disabled, buttonState, theme } ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtons;
	}
	switch ( buttonState ) {
		case 'paypal':
			return colors.paypalGold;
		case 'primary':
			return colors.primary;
		case 'secondary':
			return colors.highlight;
		default:
			return 'none';
	}
}

function getBackgroundAccentColor( { disabled, buttonState, theme } ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtonsAccent;
	}
	switch ( buttonState ) {
		case 'paypal':
			return colors.paypalGoldHover;
		case 'primary':
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
