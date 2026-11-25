import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Controller } from 'react-hook-form';
import {
	getUrlValidationError,
	getValidationMessage,
} from 'calypso/blocks/import/capture/url-validation-message-helper';
import WordPressComPageMessage from 'calypso/blocks/import/capture/wordpress-com-page-message';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { CredentialsFormFieldProps } from '../types';
import { ErrorMessage } from './error-message';

export const SiteAddressField: React.FC< CredentialsFormFieldProps > = ( { control, errors } ) => {
	const translate = useTranslate();

	const validateSiteAddress = ( siteAddress: string ) => {
		const error = getUrlValidationError( siteAddress );
		// react-hook-form keeps this as a plain string, so its sentence and link are rendered below.
		if ( error === 'wordpress_com_page' ) {
			return error;
		}
		if ( error ) {
			return getValidationMessage( error, translate );
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
			<ErrorMessage error={ errors?.from_url }>
				{ errors?.from_url?.message === 'wordpress_com_page' && <WordPressComPageMessage /> }
			</ErrorMessage>
		</div>
	);
};
