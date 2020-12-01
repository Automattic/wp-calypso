/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Theme } from 'src/lib/theme';
import styled from '../lib/styled';

const RadioButtonWrapper = styled.div<
	RadioButtonWrapperProps & React.HTMLAttributes< HTMLDivElement >
>`
	position: relative;
	margin-top: 8px;
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
	outline: ${ getOutline };

	:first-of-type {
		margin: 0;
	}

	::before {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		content: '';
		border: ${ getBorderWidth } solid ${ getBorderColor };
		border-radius: 3px;
		box-sizing: border-box;

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

const Label = styled.label< LabelProps & React.LabelHTMLAttributes< HTMLLabelElement > >`
	position: relative;
	padding: 16px 14px 16px 40px;
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: flex-start;
	font-size: 14px;

	.rtl & {
		padding: 16px 40px 16px 14px;
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
		top: 19px;
		left: 16px;
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
		top: 23px;
		left: 20px;
		position: absolute;
		background: ${ getRadioColor };
		box-sizing: border-box;
		z-index: 3;

		.rtl & {
			right: 20px;
			left: auto;
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
	id,
	ariaLabel,
}: RadioButtonProps ): JSX.Element {
	const [ isFocused, changeFocus ] = useState( false );

	return (
		<RadioButtonWrapper disabled={ disabled } isFocused={ isFocused } checked={ checked }>
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
	checked?: boolean;
	value: string;
	onChange?: () => void;
	ariaLabel: string;
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
	ariaLabel: PropTypes.string.isRequired,
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

function getBorderWidth( { checked }: { checked?: boolean } ) {
	return checked ? '3px' : '1px';
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
