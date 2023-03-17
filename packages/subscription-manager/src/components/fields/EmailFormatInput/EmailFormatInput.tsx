/* eslint-disable no-restricted-imports */
import { useTranslate } from 'i18n-calypso';
import { FormEventHandler } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import './styles.scss';

export type EmailFormatType = 'html' | 'text';

type EmailFormatInputProps = {
	value: EmailFormatType;
	onChange: FormEventHandler< HTMLSelectElement >;
};

const EmailFormatInput = ( { value, onChange }: EmailFormatInputProps ) => {
	const translate = useTranslate();

	return (
		<FormFieldset className="email-format-input">
			<FormLabel htmlFor="subscription_delivery_mail_option">
				{ translate( 'Email format' ) }
			</FormLabel>
			<FormSelect name="email_format_setting" onChange={ onChange } value={ value }>
				<option value="html">{ translate( 'HTML' ) }</option>
				<option value="text">{ translate( 'Plain Text' ) }</option>
			</FormSelect>
		</FormFieldset>
	);
};

export default EmailFormatInput;
