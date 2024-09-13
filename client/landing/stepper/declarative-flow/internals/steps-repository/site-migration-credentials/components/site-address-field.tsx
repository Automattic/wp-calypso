import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Controller, Control } from 'react-hook-form';
import getValidationMessage from 'calypso/blocks/import/capture/url-validation-message-helper';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { CredentialsFormData } from '../types';
import { ErrorMessage } from './error-message';

interface Props {
	control: Control< CredentialsFormData >;
	errors: any;
	importSiteQueryParam?: string | undefined | null;
}

export const SiteAddressField: React.FC< Props > = ( {
	control,
	errors,
	importSiteQueryParam,
} ) => {
	const translate = useTranslate();

	const validateSiteAddress = ( siteAddress: string ) => {
		const isSiteAddressValid = CAPTURE_URL_RGX.test( siteAddress );
		if ( ! isSiteAddressValid ) {
			return getValidationMessage( siteAddress, translate );
		}
	};

	return (
		<div className="site-migration-credentials__form-field">
			<FormLabel htmlFor="site-address">{ translate( 'Site address' ) }</FormLabel>
			<Controller
				control={ control }
				name="siteAddress"
				rules={ {
					required: translate( 'Please enter your WordPress site address' ),
					validate: validateSiteAddress,
				} }
				render={ ( { field } ) => (
					<FormTextInput
						id="site-address"
						isError={ !! errors.siteAddress }
						placeholder={ translate( 'Enter your WordPress site address' ) }
						readOnly={ !! importSiteQueryParam }
						disabled={ !! importSiteQueryParam }
						type="text"
						{ ...field }
					/>
				) }
			/>
			<ErrorMessage error={ errors.siteAddress } />
		</div>
	);
};
