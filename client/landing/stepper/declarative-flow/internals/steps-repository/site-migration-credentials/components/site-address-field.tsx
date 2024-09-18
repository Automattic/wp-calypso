import { FormLabel } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { Controller, Control } from 'react-hook-form';
import getValidationMessage from 'calypso/blocks/import/capture/url-validation-message-helper';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { CredentialsFormData } from '../types';
import { ErrorMessage } from './error-message';

interface Props {
	control: Control< CredentialsFormData >;
	errors?: any;
	importSiteQueryParam?: string | undefined | null;
}

export const SiteAddressField: React.FC< Props > = ( {
	control,
	errors,
	importSiteQueryParam,
} ) => {
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

	return (
		<div className="site-migration-credentials__form-field">
			<FormLabel htmlFor="from_url">{ translate( 'Site address' ) }</FormLabel>
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
						readOnly={ !! importSiteQueryParam }
						disabled={ !! importSiteQueryParam }
						type="text"
						{ ...field }
					/>
				) }
			/>
			<ErrorMessage error={ errors?.from_url } />
		</div>
	);
};
