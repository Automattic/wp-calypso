/**
 * External dependencies
 */
import React from 'react';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import Button from './Button';

// TODO: fix all these interpolations to be declarative
// TODO: convert components here to functional Components

const Label = ( { color } ) => {
	return styled.label`
		display: block;
		color: ${color};
		font-weight: 700;
		font-size: 14px;
		margin-bottom: 8px;
	`;
};

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

const InputWrapper = () => {
	return styled.div`
		position: relative;
	`;
};

const FieldIcon = () => {
	return styled.div`
		position: absolute;
		top: 50%;
		transform: translateY( -50% );
		right: 10px;
	`;
};

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

const Description = ( { color } ) => {
	return styled.p`
		margin: 8px 0 0 0;
		color: ${color};
		font-style: italic;
		font-size: 14px;
	`;
};

function RenderedIcon( { icon, iconAction, isIconVisible } ) {
	if ( ! isIconVisible ) {
		return null;
	}

	if ( iconAction ) {
		return (
			<ButtonIconUI>
				<Button onClick={ iconAction } label={ icon } />
			</ButtonIconUI>
		);
	}

	if ( icon ) {
		return <FieldIcon>{ icon }</FieldIcon>;
	}

	return null;
}

function RenderedDescription( { description, isError, errorMessage, colors } ) {
	if ( description || isError ) {
		return (
			<Description color={ isError ? colors.red50 : colors.gray50 }>
				{ isError ? errorMessage : description }
			</Description>
		);
	}
}

export default function Field( {
	type,
	id,
	className,
	isError,
	colors,
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
	const fieldOnChange = e => {
		if ( onChange ) {
			onChange( e.target );
		}

		return null;
	};

	const onBlurField = () => {
		return null;
	};

	return (
		<div className={ className }>
			<Label htmlFor={ value } color={ isError ? colors.red50 : colors.gray80 }>
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
				colors={ colors }
			/>
		</div>
	);
}
