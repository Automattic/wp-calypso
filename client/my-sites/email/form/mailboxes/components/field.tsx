import { FormInputValidation } from '@automattic/components';
import { useState } from 'react';
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

interface MailboxFormFieldProps {
	domains: string[];
	field: MailboxFormFieldBase< string >;
	isPasswordField?: boolean;
	lowerCaseChangeValue?: boolean;
	notifyFieldValueChanged?: ( field: MailboxFormFieldBase< string > ) => void;
	requestFieldValidation: ( field: MailboxFormFieldBase< string > ) => void;
	selectedDomainName: string;
	textInputPrefix?: string;
	textInputSuffix?: string;
}

const MailboxFieldInput = ( {
	field,
	isPasswordField = false,
	onBlur,
	onChange,
	textInputPrefix,
	textInputSuffix,
}: MailboxFormFieldProps & {
	onBlur: () => void;
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
} ): JSX.Element => {
	const hasAffix = Boolean( textInputPrefix ) || Boolean( textInputSuffix );
	const FormTextComponent = hasAffix ? FormTextInputWithAffixes : FormTextInput;

	const commonProps = {
		isError: field.hasError(),
		onBlur,
		onChange,
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
}: MailboxFormFieldProps & { children?: JSX.Element } ): JSX.Element => {
	const {
		field,
		lowerCaseChangeValue = false,
		requestFieldValidation,
		notifyFieldValueChanged = () => undefined,
	} = props;
	const fieldLabelText = useGetDefaultFieldLabelText( field.fieldName as MutableFormFieldNames );
	const [ fieldState, setFieldState ] = useState( { value: field.value, error: field.error } );

	if ( ! field.isVisible ) {
		return <></>;
	}

	const onBlur = () => {
		requestFieldValidation( field );
		setFieldState( { ...fieldState, error: field.error } );
	};

	const onChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		let value = event?.target?.value;
		if ( value && lowerCaseChangeValue ) {
			value = value.toLowerCase();
		}
		field.value = value;

		let error = fieldState.error;
		// Validate the field on the fly if there was already an error
		if ( error ) {
			requestFieldValidation( field );
			error = field.error;
		}
		setFieldState( { ...fieldState, error, value } );
		notifyFieldValueChanged( field );
	};

	return (
		<FormFieldset>
			<FormLabel>
				{ fieldLabelText }
				<MailboxFieldInput { ...props } onBlur={ onBlur } onChange={ onChange } />
				{ children }
			</FormLabel>
			{ fieldState.error && <FormInputValidation text={ fieldState.error } isError /> }
		</FormFieldset>
	);
};

export type { MailboxFormFieldProps };
export { MailboxField };
