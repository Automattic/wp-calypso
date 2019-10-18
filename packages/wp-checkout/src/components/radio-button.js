/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Label = styled.label`
	position: relative;
	padding: 16px 14px;
	margin-top: 8px;
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: center;
	outline: ${getOutline};

	:first-child {
		margin: 0;
	}

	:hover {
		cursor: pointer;
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
		border: 3px solid ${props => props.theme.colors.highlight};
	}

	img {
		filter: grayscale( ${getGrayscaleValue} );
	}

	:hover img {
		filter: grayscale( 0 );
	}
`;

const Radio = styled.input`
	margin-right: 7px;
	position: relative;
	display: inline-block;
	opacity: 0;
`;

const LabelContent = styled.span`
	flex: 1;
	display: flex;
	justify-content: space-between;
	position: relative;
	font-size: 14px;
	transform: translateY( -1px );

	:after {
		display: block;
		width: 16px;
		height: 16px;
		content: '';
		border: ${getRadioBorderWidth} solid ${getBorderColor};
		border-radius: 100%;
		top: 01px;
		left: -23px;
		position: absolute;
		background: ${props => props.theme.colors.white};
		box-sizing: border-box;
		z-index: 2;
	}
`;

function getBorderColor( { checked, theme } ) {
	return checked ? theme.colors.highlight : theme.colors.gray20;
}

function getBorderWidth( { checked } ) {
	return checked ? '3px' : '1px';
}

function getRadioBorderWidth( { checked } ) {
	return checked ? '5px' : '1px';
}

function getGrayscaleValue( { checked } ) {
	return checked ? 0 : '100%';
}

function getOutline( { isFocused } ) {
	if ( isFocused ) {
		return '#5198D9 auto 5px';
	}
	return '0';
}

export default function RadioButton( { checked, name, value, onChange, children } ) {
	const [ isFocused, changeFocus ] = useState( false );
	return (
		<Label isFocused={ isFocused } checked={ checked }>
			<Radio
				type="radio"
				name={ name }
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
			/>
			<LabelContent checked={ checked }>{ children }</LabelContent>
		</Label>
	);
}

RadioButton.propTypes = {
	name: PropTypes.string.isRequired,
	checked: PropTypes.bool,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func,
};
