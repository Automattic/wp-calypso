import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Controller } from 'react-hook-form';
import getValidationMessage from 'calypso/blocks/import/capture/url-validation-message-helper';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { CredentialsFormFieldProps } from '../types';
import { ErrorMessage } from './error-message';

export const SiteAddressField: React.FC< CredentialsFormFieldProps > = ( { control, errors } ) => {
	const translate = useTranslate();

	const validateSiteAddress = ( siteAddress: string ) => {
		const isSiteAddressValid = CAPTURE_URL_RGX.test( siteAddress );
		if ( ! isSiteAddressValid ) {
			return getValidationMessage( siteAddress, translate );
		}
	};

	return (
		<div className="site-migration-credentials__form-field">
			<FormLabel htmlFor="from_url">{ translate( 'Current WordPress site address' ) }</FormLabel>
			<Controller
				control={ control }
				name="from_url"
				rules={ {
					required: translate( 'Please enter your WordPress site address.' ),
					validate: validateSiteAddress,
				} }
				render={ ( { field } ) => (
					<FormTextInput id="from_url" isError={ !! errors?.from_url } type="text" { ...field } />
				) }
			/>
			<ErrorMessage error={ errors?.from_url } />
		</div>
	);
};
