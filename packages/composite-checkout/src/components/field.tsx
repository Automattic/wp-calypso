/**
 * External dependencies
 */
import React, { LabelHTMLAttributes, InputHTMLAttributes, HTMLAttributes } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import styled from '../lib/styled';
import Button from './button';

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
	autoComplete,
	disabled,
}: FieldProps ) {
	const fieldOnChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
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
	isError: PropTypes.bool,
	onChange: PropTypes.func,
	label: PropTypes.string,
	value: PropTypes.string,
	icon: PropTypes.node,
	iconAction: PropTypes.func,
	isIconVisible: PropTypes.bool,
	placeholder: PropTypes.string,
	tabIndex: PropTypes.number,
	description: PropTypes.string,
	errorMessage: PropTypes.string,
	autoComplete: PropTypes.string,
	disabled: PropTypes.bool,
};

interface FieldProps {
	type?: string;
	id: string;
	className?: string;
	isError?: boolean;
	onChange?: ( value: string ) => void;
	label?: string;
	value?: string;
	icon?: React.ReactNode;
	iconAction?: () => void;
	isIconVisible?: boolean;
	placeholder?: string;
	tabIndex?: number;
	description?: string;
	errorMessage?: string;
	autoComplete?: string;
	disabled?: boolean;
}

const Label = styled.label< { disabled?: boolean } & LabelHTMLAttributes< HTMLLabelElement > >`
	display: block;
	color: ${ ( props ) => props.theme.colors.textColor };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	}
`;

const Input = styled.input<
	{ isError?: boolean; icon?: React.ReactNode } & InputHTMLAttributes< HTMLInputElement >
>`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;

	//override leaky styles from Calypso
	&[type='text'],
	&[type='number'] {
		border: 1px solid
			${ ( props ) =>
				props.isError ? props.theme.colors.error : props.theme.colors.borderColor };
		padding: 13px ${ ( props ) => ( props.icon ? '60px' : '10px' ) } 11px 10px;
		line-height: 1.2;

		.rtl & {
			padding: 13px 10px 11px ${ ( props ) => ( props.icon ? '60px' : '10px' ) };
		}
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

	&[type='number'],
	&[type='number'] {
		-moz-appearance: none;
		appearance: none;
	}

	::placeholder {
		color: ${ ( props ) => props.theme.colors.placeHolderTextColor };
	}

	&[type='text']:disabled,
	&[type='number']:disabled {
		border: 1px solid
			${ ( props ) =>
				props.isError ? props.theme.colors.error : props.theme.colors.borderColor };
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

const Description = styled.p< { isError?: boolean } & HTMLAttributes< HTMLParagraphElement > >`
	margin: 8px 0 0;
	color: ${ ( props ) =>
		props.isError ? props.theme.colors.error : props.theme.colors.textColorLight };
	font-style: italic;
	font-size: 14px;
`;

function RenderedIcon( {
	icon,
	iconAction,
	isIconVisible,
}: {
	icon?: React.ReactNode;
	iconAction?: () => void;
	isIconVisible?: boolean;
} ) {
	if ( ! isIconVisible ) {
		return null;
	}

	if ( iconAction ) {
		return (
			<ButtonIcon>
				<Button onClick={ iconAction }>{ icon as React.ReactChildren }</Button>
			</ButtonIcon>
		);
	}

	if ( icon ) {
		return <FieldIcon>{ icon }</FieldIcon>;
	}

	return null;
}

function RenderedDescription( {
	description,
	isError,
	errorMessage,
}: {
	description?: string;
	isError?: boolean;
	errorMessage?: string;
} ) {
	if ( description || isError ) {
		return <Description isError={ isError }>{ isError ? errorMessage : description }</Description>;
	}
	return null;
}
