import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useState, useCallback, ChangeEvent, FocusEvent, MouseEvent } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import './style.scss';

const noop = () => {};

type FormTextInputWithValueGenerationProps = {
	id?: string;
	className?: string;
	action?: string;
	value?: string;
	onAction?: ( event: MouseEvent< HTMLButtonElement > ) => void;
	onFocus?: ( event: FocusEvent< HTMLInputElement > ) => void;
	onBlur?: ( event: FocusEvent< HTMLInputElement > ) => void;
	onChange?: ( event: ChangeEvent< HTMLInputElement > ) => void;
	disabled?: boolean;
	isError?: boolean;
	isValid?: boolean;
	textInputAriaLabel?: string;
	buttonAriaLabel?: string;
	maxLength?: string;
};

const FormTextInputWithValueGeneration = ( {
	className,
	action,
	value,
	onAction = noop,
	onChange = noop,
	onFocus = noop,
	onBlur = noop,
	disabled = false,
	isError = false,
	isValid = false,
	textInputAriaLabel = translate( 'enter value' ),
	buttonAriaLabel = translate( 'generate value' ),
	maxLength = '10',
	...props
}: FormTextInputWithValueGenerationProps ) => {
	const [ focused, setFocused ] = useState( false );

	const handleFocus = useCallback(
		( event: FocusEvent< HTMLInputElement > ) => {
			setFocused( true );
			onFocus( event );
		},
		[ onFocus ]
	);

	const handleBlur = useCallback(
		( event: FocusEvent< HTMLInputElement > ) => {
			setFocused( false );
			onBlur( event );
		},
		[ onBlur ]
	);

	return (
		<div
			className={ classNames( 'form-text-input-with-value-generation', className, {
				'is-focused': focused,
				'is-disabled': disabled,
				'is-error': isError,
				'is-valid': isValid,
			} ) }
			role="group"
		>
			<FormTextInput
				{ ...props }
				className="form-text-input-with-value-generation__input"
				disabled={ disabled }
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				onChange={ onChange }
				value={ value }
				maxLength={ maxLength }
				aria-label={ textInputAriaLabel }
			/>
			<Button
				size="compact"
				className="form-text-input-with-value-generation__button"
				disabled={ disabled }
				onClick={ onAction }
				aria-label={ buttonAriaLabel }
			>
				{ action }
			</Button>
		</div>
	);
};

export default FormTextInputWithValueGeneration;
