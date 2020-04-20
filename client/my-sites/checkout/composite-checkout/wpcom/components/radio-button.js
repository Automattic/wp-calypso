/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

export default function RadioButton( {
	checked,
	name,
	value,
	onChange,
	children,
	label,
	id,
	ariaLabel,
	isDisabled,
} ) {
	const [ isFocused, changeFocus ] = useState( false );

	return (
		<RadioButtonWrapper isDisabled={ isDisabled } isFocused={ isFocused } checked={ checked }>
			<Radio
				type="radio"
				name={ name }
				id={ id }
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
			<Label checked={ checked } htmlFor={ id } isDisabled={ isDisabled }>
				{ label }
			</Label>
			{ children && <RadioButtonChildren checked={ checked }>{ children }</RadioButtonChildren> }
		</RadioButtonWrapper>
	);
}

RadioButton.propTypes = {
	name: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	label: PropTypes.node.isRequired,
	checked: PropTypes.bool,
	isDisabled: PropTypes.bool,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	ariaLabel: PropTypes.string.isRequired,
};

const RadioButtonWrapper = styled.div`
	position: relative;
	margin-top: 8px;
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
	outline: ${getOutline};

	:first-of-type {
		margin: 0;
	}

	:before {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		content: '';
		border: ${getBorderWidth} solid ${getBorderColor};
		border-radius: 3px;
		box-sizing: border-box;
	}

	:hover:before {
		border: 3px solid ${( props ) => props.theme.colors.highlight};
	}

	.payment-logos {
		display: none;

		@media ( ${( props ) => props.theme.breakpoints.smallPhoneUp} ) {
			display: block;
		}
	}

	svg {
		filter: grayscale( ${getGrayscaleValue} );
	}

	:hover svg {
		filter: grayscale( 0 );
	}

	${handleWrapperDisabled};
`;

const Radio = styled.input`
	position: absolute;
	opacity: 0;
`;

const Label = styled.label`
	position: relative;
	padding: 16px 14px 16px 40px;
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;

	:hover {
		cursor: pointer;
	}

	:before {
		display: block;
		width: 16px;
		height: 16px;
		content: '';
		border: 1px solid ${( props ) => props.theme.colors.borderColor};
		border-radius: 100%;
		top: 50%;
		transform: translateY( -50% );
		left: 16px;
		position: absolute;
		background: ${( props ) => props.theme.colors.surface};
		box-sizing: border-box;
		z-index: 2;
	}

	:after {
		display: block;
		width: 8px;
		height: 8px;
		content: '';
		border-radius: 100%;
		top: 50%;
		transform: translateY( -50% );
		left: 20px;
		position: absolute;
		background: ${getRadioColor};
		box-sizing: border-box;
		z-index: 3;
	}

	${handleLabelDisabled};
`;

const RadioButtonChildren = styled.div`
	display: ${( props ) => ( props.checked ? 'block' : 'none') };
`;

function getBorderColor( { checked, theme } ) {
	return checked ? theme.colors.highlight : theme.colors.borderColor;
}

function getRadioColor( { checked, theme } ) {
	return checked ? theme.colors.highlight : theme.colors.surface;
}

function getBorderWidth( { checked } ) {
	return checked ? '3px' : '1px';
}

function getGrayscaleValue( { checked } ) {
	return checked ? 0 : '100%';
}

function getOutline( { isFocused, theme } ) {
	if ( isFocused ) {
		return theme.colors.outline + ' solid 2px';
	}
	return '0';
}

function handleWrapperDisabled( { isDisabled } ) {
	if ( ! isDisabled ) {
		return null;
	}

	return `
		:before,
		:hover:before {
			border: 1px solid lightgray;
		}
	`;
}

function handleLabelDisabled( { isDisabled } ) {
	if ( ! isDisabled ) {
		return null;
	}

	return `
		color: lightgray;
		font-style: italic;
		
		:hover {
			cursor: default;
		}
		
		:before {
			border: 1px solid lightgray;
			background: lightgray;
		}
		
		:after {
			background: white;
		}
		
		span {
			color: lightgray;
		}
	`;
}
