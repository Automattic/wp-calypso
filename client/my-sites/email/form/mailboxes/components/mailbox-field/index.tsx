import { FormInputValidation } from '@automattic/components';
import { InvalidEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { useGetDefaultFieldLabelText } from 'calypso/my-sites/email/form/mailboxes/components/use-get-default-field-label-text';
import type {
	MailboxFormFieldBase,
	MutableFormFieldNames,
} from 'calypso/my-sites/email/form/mailboxes/types';
import type { ChangeEvent } from 'react';

import './style.scss';

interface MailboxFormFieldProps {
	field: MailboxFormFieldBase< string >;
	isAutoFocusEnabled?: boolean;
	isFirstVisibleField?: boolean;
	isPasswordField?: boolean;
	lowerCaseChangeValue?: boolean;
	onFieldValueChanged?: ( field: MailboxFormFieldBase< string > ) => void;
	onRequestFieldValidation: ( field: MailboxFormFieldBase< string > ) => void;
	textInputPrefix?: string;
	textInputSuffix?: string;
}

const MailboxFieldInput = ( {
	field,
	isFirstVisibleField = false,
	isAutoFocusEnabled = false,
	isPasswordField = false,
	onBlur,
	onChange,
	onInvalid,
	textInputPrefix,
	textInputSuffix,
}: MailboxFormFieldProps & {
	onBlur: () => void;
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
	onInvalid: ( event: InvalidEvent< HTMLInputElement > ) => void;
} ): JSX.Element => {
	const hasAffix = Boolean( textInputPrefix ) || Boolean( textInputSuffix );
	const FormTextComponent = hasAffix ? FormTextInputWithAffixes : FormTextInput;

	const commonProps = {
		isError: field.hasError(),
		name: field.fieldName,
		onBlur,
		onChange,
		onInvalid,
		...( isFirstVisibleField && isAutoFocusEnabled ? { autoFocus: true } : {} ),
		required: field.isRequired,
		value: field.value,
	};

	if ( isPasswordField ) {
		return (
			<FormPasswordInput
				autoCapitalize="off"
				autoCorrect="off"
				maxLength={ 100 }
				{ ...commonProps }
			/>
		);
	}

	return (
		<FormTextComponent prefix={ textInputPrefix } suffix={ textInputSuffix } { ...commonProps } />
	);
};

const MailboxField = ( {
	children,
	...props
}: MailboxFormFieldProps & { children?: JSX.Element } ): JSX.Element | null => {
	const {
		field: originalField,
		lowerCaseChangeValue = false,
		onRequestFieldValidation,
		onFieldValueChanged = () => undefined,
	} = props;

	const [ { field }, setFieldState ] = useState( { field: originalField } );
	const fieldLabelText = useGetDefaultFieldLabelText( field.fieldName as MutableFormFieldNames );

	if ( ! field.isVisible ) {
		return null;
	}

	field.dispatchState = () => {
		setFieldState( { field } );
	};

	const onBlur = () => {
		if ( ! field.isTouched ) {
			field.isTouched = field.hasValidValue();
		}
		onRequestFieldValidation( field );
		field.dispatchState();
	};

	const onChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		let value = event?.target?.value;
		if ( value && lowerCaseChangeValue ) {
			value = value.toLowerCase();
		}
		field.value = value;

		// Validate the field on the fly if there was already an error, or the field was already touched
		if ( field.error || field.isTouched ) {
			onRequestFieldValidation( field );
		}
		field.dispatchState();
		onFieldValueChanged( field );
	};

	const onInvalid = ( event: InvalidEvent< HTMLInputElement > ) => {
		event.preventDefault();
		onRequestFieldValidation( field );
		field.dispatchState();
	};

	return (
		<FormFieldset>
			<FormLabel className="mailbox-field__form-label">
				{ fieldLabelText }
				<MailboxFieldInput
					{ ...props }
					onBlur={ onBlur }
					onChange={ onChange }
					onInvalid={ onInvalid }
				/>
				{ children }
			</FormLabel>
			{ field.error && <FormInputValidation text={ field.error } isError /> }
		</FormFieldset>
	);
};

export type { MailboxFormFieldProps };
export { MailboxField };
