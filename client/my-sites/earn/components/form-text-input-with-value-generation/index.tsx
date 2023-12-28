import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useState, useCallback, ChangeEvent } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';

import './style.scss';

const noop = () => {};

type FormTextInputWithValueGenerationProps = {
	className?: string;
	action?: string;
	value?: string;
	onAction?: () => void;
	onFocus?: () => void;
	onChange?: ( event: ChangeEvent< HTMLInputElement > ) => void;
	disabled?: boolean;
	isError?: boolean;
	isValid?: boolean;
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
	...props
}: FormTextInputWithValueGenerationProps ) => {
	const [ focused, setFocused ] = useState( false );

	const handleFocus = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
			setFocused( true );
			onFocus( event );
		},
		[ onFocus ]
	);

	const handleBlur = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
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
			/>
			<Button
				size="compact"
				className="form-text-input-with-value-generation__button"
				disabled={ disabled }
				onClick={ onAction }
			>
				{ action }
			</Button>
		</div>
	);
};

export default FormTextInputWithValueGeneration;
