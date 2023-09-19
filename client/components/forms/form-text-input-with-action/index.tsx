import classNames from 'classnames';
import { useState, useCallback, FC, ReactNode } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface FormTextInputWithActionProps {
	className?: string;
	action?: ReactNode;
	inputRef?: ( instance: HTMLInputElement | null ) => void;
	onFocus?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onChange?: ( value: string, event: React.ChangeEvent< HTMLInputElement > ) => void;
	onAction?: ( value: string, event: React.SyntheticEvent ) => void;
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
		( event: React.FocusEvent< HTMLInputElement > ) => {
			setFocused( true );
			onFocus( event );
		},
		[ onFocus ]
	);

	const handleBlur = useCallback(
		( event: React.FocusEvent< HTMLInputElement > ) => {
			setFocused( false );
			onBlur( event );
		},
		[ onBlur ]
	);

	const handleChange = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			setValue( event.target.value );
			onChange( event.target.value, event );
		},
		[ onChange ]
	);

	const handleAction = useCallback(
		( event: React.SyntheticEvent ) => {
			if ( value ) {
				onAction( value, event );
				clearOnSubmit && setValue( '' );
			}
		},
		[ onAction, value, clearOnSubmit ]
	);

	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLInputElement > ) => {
			onKeyDown( event );
			if ( event.key === 'Enter' && value ) {
				handleAction( event );
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
