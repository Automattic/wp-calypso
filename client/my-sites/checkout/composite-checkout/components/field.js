/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { Button } from '@automattic/composite-checkout';

export default function Field( {
	type,
	id,
	className,
	inputClassName,
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
	autoComplete,
	disabled,
} ) {
	const fieldOnChange = ( event ) => {
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
			{ label && (
				<Label htmlFor={ id } disabled={ disabled }>
					{ label }
				</Label>
			) }

			<InputWrapper>
				<Input
					className={ inputClassName }
					id={ id }
					icon={ icon }
					value={ value }
					type={ type }
					onChange={ fieldOnChange }
					onBlur={ onBlurField }
					placeholder={ placeholder }
					tabIndex={ tabIndex }
					isError={ isError }
					autoComplete={ autoComplete }
					disabled={ disabled }
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

Field.propTypes = {
	type: PropTypes.string,
	id: PropTypes.string.isRequired,
	className: PropTypes.string,
	inputClassName: PropTypes.string,
	isError: PropTypes.bool,
	onChange: PropTypes.func,
	label: PropTypes.string,
	value: PropTypes.string,
	icon: PropTypes.node,
	iconAction: PropTypes.func,
	isIconVisible: PropTypes.bool,
	placeholder: PropTypes.string,
	tabIndex: PropTypes.string,
	description: PropTypes.string,
	errorMessage: PropTypes.string,
	autoComplete: PropTypes.string,
	disabled: PropTypes.bool,
};

const Label = styled.label`
	display: block;
	color: ${ ( props ) => props.theme.colors.textColor };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	}
`;

const Input = styled.input`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;
	border: 1px solid
		${ ( props ) => ( props.isError ? props.theme.colors.error : props.theme.colors.borderColor ) };
	padding: 7px ${ ( props ) => ( props.icon ? '60px' : '10px' ) } 7px 10px;
	line-height: 1.5;

	.rtl & {
		padding: 7px 10px 7px ${ ( props ) => ( props.icon ? '60px' : '10px' ) };
	}

	:focus {
		outline: ${ ( props ) =>
				props.isError ? props.theme.colors.error : props.theme.colors.outline }
			solid 2px !important;
	}

	::-webkit-inner-spin-button,
	::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	[type='number'],
	[type='number'] {
		-moz-appearance: none;
		appearance: none;
	}

	::placeholder {
		color: ${ ( props ) => props.theme.colors.placeHolderTextColor };
	}

	:disabled {
		background: ${ ( props ) => props.theme.colors.disabledField };
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

	.rtl & {
		right: auto;
		left: 10px;
	}
`;

const ButtonIcon = styled.div`
	position: absolute;
	top: 0;
	right: 0;

	.rtl & {
		right: auto;
		left: 0;
	}

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
	margin: 8px 0 0;
	color: ${ ( props ) =>
		props.isError ? props.theme.colors.error : props.theme.colors.textColorLight };
	font-style: italic;
	font-size: 14px;
`;

function RenderedIcon( { icon, iconAction, isIconVisible } ) {
	if ( ! isIconVisible ) {
		return null;
	}

	if ( iconAction ) {
		return (
			<ButtonIcon>
				<Button onClick={ iconAction }>{ icon }</Button>
			</ButtonIcon>
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
