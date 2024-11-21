import { isEnabled } from '@automattic/calypso-config';
import { FormLabel } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { Controller } from 'react-hook-form';
import getValidationMessage from 'calypso/blocks/import/capture/url-validation-message-helper';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { CredentialsFormFieldProps } from '../types';
import { ErrorMessage } from './error-message';

export const SiteAddressField: React.FC< CredentialsFormFieldProps > = ( { control, errors } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const validateSiteAddress = ( siteAddress: string ) => {
		const isSiteAddressValid = CAPTURE_URL_RGX.test( siteAddress );
		if ( ! isSiteAddressValid ) {
			return getValidationMessage( siteAddress, translate );
		}
	};

	const placeholder = hasEnTranslation( 'Enter your WordPress site address' )
		? translate( 'Enter your WordPress site address' )
		: translate( 'Enter your WordPress site address.' );

	const labelText = isEnabled( 'automated-migration/application-password' )
		? translate( 'Current WordPress site address' )
		: translate( 'Current site address' );

	return (
		<div className="site-migration-credentials__form-field">
			<FormLabel htmlFor="from_url">{ labelText }</FormLabel>
			<Controller
				control={ control }
				name="from_url"
				rules={ {
					required: translate( 'Please enter your WordPress site address.' ),
					validate: validateSiteAddress,
				} }
				render={ ( { field } ) => (
					<FormTextInput
						id="from_url"
						isError={ !! errors?.from_url }
						placeholder={ placeholder }
						type="text"
						{ ...field }
					/>
				) }
			/>
			<ErrorMessage error={ errors?.from_url } />
		</div>
	);
};
