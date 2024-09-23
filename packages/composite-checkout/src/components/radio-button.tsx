import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as React from 'react';
import { Theme } from '../lib/theme';

const RadioButtonWrapper = styled.div<
	RadioButtonWrapperProps & React.HTMLAttributes< HTMLDivElement >
>`
	position: relative;
	display: ${ ( props ) => ( props.hidden ? 'none' : 'block' ) };
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
	outline: ${ getOutline };

	::before {
		display: ${ ( props ) => ( props.hidden ? 'none' : 'block' ) };
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		content: '';
		border: ${ ( props ) => ( props.checked ? '1px solid ' + getBorderColor( props ) : 'none' ) };
		border-bottom: ${ ( props ) => '1px solid ' + getBorderColor( props ) };
		box-sizing: border-box;
		border-radius: 3px;

		.rtl & {
			right: 0;
			left: auto;
		}
	}

	:hover::before {
		border: 3px solid ${ ( props ) => props.theme.colors.highlight };
	}

	.payment-logos {
		display: none;

		@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			display: block;
			filter: grayscale( ${ getGrayscaleValue } );
		}
	}

	:hover .payment-logos {
		@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			filter: grayscale( 0 );
		}
	}

	.credit-card__logos {
		${ ( props ) => ( props.checked ? `display:flex;` : `display:none;` ) }

		@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			display: flex;
			filter: grayscale( ${ getGrayscaleValue } );
		}
	}

	svg {
		filter: grayscale( ${ getGrayscaleValue } );
	}

	:hover svg {
		filter: grayscale( 0 );
	}

	${ handleWrapperDisabled };
`;

interface RadioButtonWrapperProps {
	disabled?: boolean;
	isFocused?: boolean;
	checked?: boolean;
}

const Radio = styled.input`
	position: absolute;
	opacity: 0 !important;

	clear: none;
	cursor: pointer;
	display: inline-block;
	line-height: 0;
	height: 16px;
	margin: 2px 0 0;
	float: left;
	outline: 0;
	padding: 0;
	text-align: center;
	vertical-align: middle;
	width: 16px;
	min-width: 16px;
	appearance: none;
`;

interface LabelProps {
	disabled?: boolean;
	checked?: boolean;
}

/**
 * This is the label used by radio buttons. It includes a before/after which
 * are fake radio button dots whereas the actual radio button dots are hidden.
 */
const Label = styled.label< LabelProps & React.LabelHTMLAttributes< HTMLLabelElement > >`
	position: relative;
	padding: 16px 14px 16px 56px;
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	justify-content: center;
	align-items: flex-start;
	align-content: center;
	font-size: 14px;
	height: fit-content;
	min-height: 72px;

	.rtl & {
		padding: 16px 56px 16px 14px;
	}

	:hover {
		cursor: pointer;
	}

	::before {
		display: block;
		width: 16px;
		height: 16px;
		content: '';
		border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
		border-radius: 100%;
		top: 40%;
		left: 24px;
		position: absolute;
		background: ${ ( props ) => props.theme.colors.surface };
		box-sizing: border-box;
		z-index: 2;

		.rtl & {
			right: 16px;
			left: auto;
		}
	}

	::after {
		display: block;
		width: 8px;
		height: 8px;
		content: '';
		border-radius: 100%;
		margin-top: 4px;
		top: 40%;
		left: 28px;
		position: absolute;
		background: ${ getRadioColor };
		box-sizing: border-box;
		z-index: 3;

		.rtl & {
			right: 20px;
			left: auto;
		}
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			gap: 7px:
		}
}

	${ handleLabelDisabled };
`;

const RadioButtonChildren = styled.div<
	RadioButtonWrapperProps & React.HTMLAttributes< HTMLDivElement >
>`
	display: ${ ( props ) => ( props.checked ? 'block' : 'none' ) };
`;

export default function RadioButton( {
	checked,
	name,
	value,
	onChange,
	children,
	label,
	disabled,
	hidden,
	id,
	ariaLabel,
	...otherProps
}: RadioButtonProps ) {
	const [ isFocused, changeFocus ] = useState( false );

	return (
		<RadioButtonWrapper
			disabled={ disabled }
			isFocused={ isFocused }
			checked={ checked }
			hidden={ hidden }
		>
			<Radio
				type="radio"
				name={ name }
				id={ id }
				disabled={ disabled }
				value={ value }
				checked={ checked }
				onChange={ onChange }
				onFocus={ () => {
					changeFocus( true );
				} }
				onBlur={ () => {
					changeFocus( false );
				} }
				readOnly={ ! onChange }
				aria-label={ ariaLabel }
				{ ...otherProps }
			/>
			<Label checked={ checked } htmlFor={ id } disabled={ disabled }>
				{ label }
			</Label>
			{ children && <RadioButtonChildren checked={ checked }>{ children }</RadioButtonChildren> }
		</RadioButtonWrapper>
	);
}

interface RadioButtonProps {
	name: string;
	id: string;
	label: React.ReactNode;
	disabled?: boolean;
	hidden?: boolean;
	checked?: boolean;
	value: string;
	onChange?: () => void;
	ariaLabel?: string;
	children?: React.ReactNode;
}

RadioButton.propTypes = {
	name: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	label: PropTypes.node.isRequired,
	disabled: PropTypes.bool,
	checked: PropTypes.bool,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	ariaLabel: PropTypes.string,
};

function handleWrapperDisabled( { disabled }: { disabled?: boolean } ) {
	if ( ! disabled ) {
		return null;
	}

	return `
		::before,
		:hover::before {
			border: 1px solid lightgray;
		}

		svg,
		:hover svg {
			filter: grayscale( 100% );
			opacity: 50%;
		}
	`;
}

function handleLabelDisabled( { disabled }: { disabled?: boolean } ) {
	if ( ! disabled ) {
		return null;
	}

	return `
		color: lightgray;
		font-style: italic;

		:hover {
			cursor: default;
		}

		::before {
			border: 1px solid lightgray;
			background: lightgray;
		}

		::after {
			background: white;
		}

		span {
			color: lightgray;
		}
	`;
}

function getBorderColor( { checked, theme }: { checked?: boolean; theme: Theme } ) {
	return checked ? theme.colors.highlight : theme.colors.borderColor;
}

function getRadioColor( { checked, theme }: { checked?: boolean; theme: Theme } ) {
	return checked ? theme.colors.highlight : theme.colors.surface;
}

function getGrayscaleValue( { checked }: { checked?: boolean } ) {
	return checked ? 0 : '100%';
}

function getOutline( {
	isFocused,
	theme,
}: {
	isFocused?: boolean;
	checked?: boolean;
	theme: Theme;
} ) {
	if ( isFocused ) {
		return theme.colors.outline + ' solid 2px';
	}
	return '0';
}
