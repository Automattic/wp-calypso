/* eslint-disable no-restricted-imports */
import { FormLabel } from '@automattic/components';
import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { FormEventHandler } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import './styles.scss';

type EmailFormatInputProps = {
	value: Reader.EmailFormatType;
	onChange: FormEventHandler< HTMLSelectElement >;
};

const EmailFormatInput = ( { value, onChange }: EmailFormatInputProps ) => {
	const translate = useTranslate();

	return (
		<FormFieldset className="email-format-input">
			<FormLabel htmlFor="email_format_setting">{ translate( 'Email format' ) }</FormLabel>
			<FormSelect
				id="email_format_setting"
				name="email_format_setting"
				onChange={ onChange }
				value={ value }
			>
				<option value="html">{ translate( 'HTML' ) }</option>
				<option value="text">{ translate( 'Plain Text' ) }</option>
			</FormSelect>
		</FormFieldset>
	);
};

export default EmailFormatInput;
