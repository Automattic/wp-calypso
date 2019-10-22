/**
 * External dependencies
 */
import React from 'react';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import Button from './button';

const Label = styled.label`
	display: block;
	color: ${props => ( props.isError ? props.theme.colors.red50 : props.theme.colors.gray80 )};
	font-weight: 700;
	font-size: 14px;
	margin-bottom: 8px;
`;

const Input = styled.input`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;
	border: 1px solid ${props => props.theme.colors.gray20};
	padding: 12px ${props => ( props.icon ? '40px' : '10px' )} 12px 10px;

	::-webkit-inner-spin-button,
	::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	[type='number'],
	[type='number'] {
		-moz-appearance: none;
		appearance: none;
	}
`;

const InputWrapper = styled.div`
	position: relative;
`;

const FieldIcon = styled.div`
	position: absolute;
	top: 50%;
	transform: translateY( -50% );
	right: 10px;
`;

const ButtonIconUI = styled.div`
	position: absolute;
	top: 0;
	right: 0;

	button {
		border: 1px solid transparent;
		box-shadow: none;
	}

	button:hover {
		background: none;
		border: 1px solid transparent;
		box-shadow: none;

		filter: brightness( 0 ) saturate( 100% ) invert( 35% ) sepia( 22% ) saturate( 3465% )
			hue-rotate( 300deg ) brightness( 88% ) contrast( 98% );
	}
`;

const Description = styled.p`
	margin: 8px 0 0 0;
	color: ${props => ( props.isError ? props.theme.colors.red50 : props.theme.colors.gray50 )};
	font-style: italic;
	font-size: 14px;
`;

function RenderedIcon( { icon, iconAction, isIconVisible } ) {
	if ( ! isIconVisible ) {
		return null;
	}

	if ( iconAction ) {
		return (
			<ButtonIconUI>
				<Button onClick={ iconAction }>{ icon }</Button>
			</ButtonIconUI>
		);
	}

	if ( icon ) {
		return <FieldIcon>{ icon }</FieldIcon>;
	}

	return null;
}

function RenderedDescription( { description, isError, errorMessage } ) {
	if ( description || isError ) {
		return <Description isError={ isError }>{ isError ? errorMessage : description }</Description>;
	}
	return null;
}

export default function Field( {
	type,
	id,
	className,
	isError,
	onChange,
	label,
	value,
	icon,
	iconAction,
	isIconVisible,
	placeholder,
	tabIndex,
	description,
	errorMessage,
} ) {
	const fieldOnChange = event => {
		if ( onChange ) {
			onChange( event.target.value );
		}

		return null;
	};

	const onBlurField = () => {
		return null;
	};

	return (
		<div className={ className }>
			<Label htmlFor={ value } isError={ isError }>
				{ label }
			</Label>
			<InputWrapper>
				<Input
					id={ id }
					icon={ icon }
					value={ value }
					type={ type }
					onChange={ fieldOnChange }
					onBlur={ onBlurField }
					placeholder={ placeholder }
					tabIndex={ tabIndex }
				/>
				<RenderedIcon icon={ icon } iconAction={ iconAction } isIconVisible={ isIconVisible } />
			</InputWrapper>
			<RenderedDescription
				isError={ isError }
				description={ description }
				errorMessage={ errorMessage }
			/>
		</div>
	);
}
