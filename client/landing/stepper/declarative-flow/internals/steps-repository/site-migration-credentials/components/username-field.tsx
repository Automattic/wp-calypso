import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Controller } from 'react-hook-form';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { CredentialsFormFieldProps } from '../types';
import { ErrorMessage } from './error-message';

export const UsernameField: React.FC< CredentialsFormFieldProps > = ( { control, errors } ) => {
	const translate = useTranslate();

	return (
		<div className="site-migration-credentials__form-field">
			<FormLabel htmlFor="username">{ translate( 'WordPress admin username' ) }</FormLabel>
			<Controller
				control={ control }
				name="username"
				rules={ {
					required: translate( 'Please enter your WordPress admin username.' ),
				} }
				render={ ( { field } ) => (
					<FormTextInput
						id="username"
						type="text"
						isError={ !! errors?.username }
						placeholder={ translate( 'Enter your Admin username' ) }
						{ ...field }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => {
							const trimmedValue = e.target.value.trim();
							field.onChange( trimmedValue );
						} }
						onBlur={ ( e: React.FocusEvent< HTMLInputElement > ) => {
							field.onBlur();
							e.target.value = e.target.value.trim();
						} }
					/>
				) }
			/>
			<ErrorMessage error={ errors?.username } />
		</div>
	);
};
