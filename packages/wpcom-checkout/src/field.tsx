import { Button } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

// Disabling this to make migrating files easier
/* eslint-disable @typescript-eslint/no-use-before-define */
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
	prefix,
}: {
	type?: string;
	id: string;
	className?: string;
	inputClassName?: string;
	isError?: boolean;
	onChange?: ( value: string ) => void;
	label?: string;
	value: string;
	icon?: ReactNode;
	iconAction?: () => void;
	isIconVisible?: boolean;
	placeholder?: string;
	tabIndex?: number;
	description?: string;
	errorMessage?: ReactNode;
	autoComplete?: string;
	disabled?: boolean;
	prefix?: ReactNode;
} ) {
	const fieldOnChange = ( event: { target: { value: string } } ) => {
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

			<InputWrapper isError={ isError }>
				{ prefix && <span className="field__overlay-prefix">{ prefix }</span> }
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

const Label = styled.label< { disabled?: boolean } >`
	display: block;
	color: ${ ( props ) => props.theme.colors.textColor };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	}
`;

const Input = styled.input< {
	isError?: boolean;
	icon?: ReactNode;
} >`
	flex: 1;
	box-sizing: border-box;
	border: 1px solid
		${ ( props ) => ( props.isError ? props.theme.colors.error : props.theme.colors.borderColor ) };
	line-height: 1.5;
	font-size: 14px;
	padding: 7px;

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

const InputWrapper = styled.div< { isError?: boolean } >`
	position: relative;
	display: flex;
	align-items: center;
	border-radius: 3px;
	:focus-within {
		outline: ${ ( props ) =>
				props.isError ? props.theme.colors.error : props.theme.colors.outline }
			solid 2px;
	}
`;

const FieldIcon = styled.div`
	flex: 0 0 auto;
	white-space: nowrap;
`;

const ButtonIcon = styled.div`
	flex: 0 0 auto;
	white-space: nowrap;
	max-width: 100%;
	border-left: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	overflow: hidden;

	button {
		padding-block: 7px;
		padding-inline: 10px;
		border: none;
		line-height: 1.5;
	}

	button:hover {
		background: none;
		border: 1px solid transparent;
		box-shadow: none;

		filter: brightness( 0 ) saturate( 100% ) invert( 35% ) sepia( 22% ) saturate( 3465% )
			hue-rotate( 300deg ) brightness( 88% ) contrast( 98% );
	}
`;

const Description = styled.p< { isError?: boolean } >`
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
	icon?: ReactNode;
	iconAction?: () => void;
	isIconVisible?: boolean;
} ) {
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

function RenderedDescription( {
	description,
	isError,
	errorMessage,
}: {
	description?: string;
	isError?: boolean;
	errorMessage?: ReactNode;
} ) {
	if ( description || isError ) {
		return <Description isError={ isError }>{ isError ? errorMessage : description }</Description>;
	}
	return null;
}
