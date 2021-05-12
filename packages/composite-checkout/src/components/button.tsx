/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Classes
 */
import styled from '../lib/styled';
import joinClasses from '../lib/join-classes';
import { Theme } from '../lib/theme';

const CallToAction = styled( 'button' )< CallToActionProps >`
	display: block;
	width: ${ ( props: CallToActionProps ) => ( props.fullWidth ? '100%' : 'auto' ) };
	font-size: 16px;
	border-radius: ${ ( props ) => ( props.buttonType === 'paypal' ? '50px' : '2px' ) };
	padding: ${ ( props ) => ( props.buttonType === 'text-button' ? '0' : '10px 15px' ) };
	border: ${ ( props ) =>
		! props.buttonType || props.disabled ? '1px solid ' + props.theme.colors.borderColor : '0' };
	background: ${ getBackgroundColor };
	color: ${ getTextColor };
	font-weight: theme.weights.normal;
	text-decoration: ${ getTextDecoration };

	:hover {
		background: ${ getRollOverColor };
		border-color: ${ ( props ) =>
			! props.buttonType ? props.theme.colors.borderColorDark : 'inherit' };
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
		background-size: 200px 100%;
		opacity: 1;
	}

	@keyframes components-button__busy-animation {
		0% {
			background-position: 200px 0;
		}
	}
`;

interface CallToActionProps {
	fullWidth?: boolean;
	buttonType?: ButtonType;
	disabled?: boolean;
}

type ButtonType = 'primary' | 'secondary' | 'text-button' | 'borderless' | 'paypal';

const Button: React.FC< ButtonProps & React.ButtonHTMLAttributes< HTMLButtonElement > > = ( {
	className,
	buttonType,
	isBusy,
	children,
	fullWidth,
	...props
} ) => {
	const classNames = joinClasses( [
		'checkout-button',
		...( buttonType ? [ 'is-status-' + buttonType ] : [] ),
		...( isBusy ? [ 'is-busy' ] : [] ),
		...( className ? [ className ] : [] ),
	] );

	return (
		<CallToAction
			fullWidth={ fullWidth }
			buttonType={ buttonType }
			className={ classNames }
			{ ...props }
		>
			{ children }
		</CallToAction>
	);
};

export default Button;

export interface ButtonProps {
	className?: string;
	buttonType?: ButtonType;
	isBusy?: boolean;
	fullWidth?: boolean;
}

function getImageFilter( { buttonType }: { buttonType?: ButtonType } ) {
	return `grayscale( ${
		buttonType === 'primary' || buttonType === 'paypal' ? '0' : '100'
	} ) invert( 0 );`;
}

function getImageOpacity( { buttonType }: { buttonType?: ButtonType } ) {
	return buttonType === 'primary' || buttonType === 'paypal' ? '1' : '0.5';
}

function getRollOverColor( {
	disabled,
	buttonType,
	theme,
}: {
	disabled?: boolean;
	buttonType?: ButtonType;
	theme: Theme;
} ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtons;
	}
	switch ( buttonType ) {
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

function getTextColor( {
	disabled,
	buttonType,
	theme,
}: {
	disabled?: boolean;
	buttonType?: ButtonType;
	theme: Theme;
} ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledButtons;
	}
	switch ( buttonType ) {
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

function getBackgroundColor( {
	disabled,
	buttonType,
	theme,
}: {
	disabled?: boolean;
	buttonType?: ButtonType;
	theme: Theme;
} ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtons;
	}
	switch ( buttonType ) {
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

function getBackgroundAccentColor( {
	disabled,
	buttonType,
	theme,
}: {
	disabled?: boolean;
	buttonType?: ButtonType;
	theme: Theme;
} ) {
	const { colors } = theme;
	if ( disabled ) {
		return colors.disabledPaymentButtonsAccent;
	}
	switch ( buttonType ) {
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

function getTextDecoration( { buttonType }: { buttonType?: ButtonType } ) {
	return buttonType === 'text-button' ? 'underline' : 'none';
}
