/* eslint-disable @typescript-eslint/no-empty-function */
import classNames from 'classnames';
import { useState, useCallback, FC, ReactNode } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormTextInput from '../form-text-input';

import './style.scss';

const noop = () => {};

interface FormTextInputWithActionProps {
	className?: string;
	action?: ReactNode;
	inputRef?: ( instance: HTMLInputElement | null ) => void;
	onFocus?: ( e: React.FocusEvent< HTMLInputElement > ) => void;
	onBlur?: ( e: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( e: React.KeyboardEvent< HTMLInputElement > ) => void;
	onChange?: ( value: string, e: React.ChangeEvent< HTMLInputElement > ) => void;
	onAction?: ( value: string, e: React.SyntheticEvent ) => void;
	defaultValue?: string;
	disabled?: boolean;
	isError?: boolean;
	isValid?: boolean;
	clearOnSubmit?: boolean;
	[ propName: string ]: unknown;
}

const FormTextInputWithAction: FC< FormTextInputWithActionProps > = ( {
	className,
	action,
	inputRef,
	onFocus = noop,
	onBlur = noop,
	onKeyDown = noop,
	onChange = noop,
	onAction = noop,
	defaultValue = '',
	disabled,
	isError,
	isValid,
	clearOnSubmit = false,
	...props
} ) => {
	const [ focused, setFocused ] = useState( false );
	const [ value, setValue ] = useState( defaultValue );

	const handleFocus = useCallback(
		( e: React.FocusEvent< HTMLInputElement > ) => {
			setFocused( true );
			onFocus( e );
		},
		[ onFocus ]
	);

	const handleBlur = useCallback(
		( e: React.FocusEvent< HTMLInputElement > ) => {
			setFocused( false );
			onBlur( e );
		},
		[ onBlur ]
	);

	const handleChange = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => {
			setValue( e.target.value );
			onChange( e.target.value, e );
		},
		[ onChange ]
	);

	const handleAction = useCallback(
		( e: React.SyntheticEvent ) => {
			if ( value ) {
				onAction( value, e );
				clearOnSubmit && setValue( '' );
			}
		},
		[ onAction, value, clearOnSubmit ]
	);

	const handleKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLInputElement > ) => {
			onKeyDown( e );
			if ( e.key === 'Enter' && value ) {
				handleAction( e );
			}
		},
		[ handleAction, onKeyDown, value ]
	);

	return (
		<div
			className={ classNames( 'form-text-input-with-action', className, {
				'is-focused': focused,
				'is-disabled': disabled,
				'is-error': isError,
				'is-valid': isValid,
			} ) }
			role="group"
		>
			<FormTextInput
				{ ...props }
				className="form-text-input-with-action__input"
				ref={ inputRef as ( ( instance: FormTextInput | null ) => void ) | undefined }
				disabled={ disabled }
				value={ value }
				onChange={ handleChange }
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				onKeyDown={ handleKeyDown }
			/>
			<FormButton
				className="form-text-input-with-action__button is-compact"
				disabled={ disabled || ! value }
				onClick={ handleAction }
			>
				{ action }
			</FormButton>
		</div>
	);
};

export default FormTextInputWithAction;
