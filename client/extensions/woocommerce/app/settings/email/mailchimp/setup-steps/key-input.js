/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import { localize } from 'i18n-calypso';

export default localize( ( { translate, onChange, apiKey, isKeyCorrect } ) => (
	<FormFieldset className="setup-steps__mailchimp-key-input">
		<div className="setup-steps__mailchimp-api-intro-notice">
			{ translate( 'Now that you\'re signed in to MailChimp, you need an API key to start the connection process' ) }
		</div>
		<div className="setup-steps__mailchimp-api-directions" >
			<span>{ translate( 'To find your Mailchimp API key, go to ' ) }</span>
			<span className="setup-steps__mailchimp-api-directions-bold">
				{ translate( 'Settting > Extras > API keys.' ) }
			</span>
			<div>{ translate( 'From there, grab an existing key or generate a new on for your store.' ) } </div>
		</div>
		<FormLabel required={ ! isKeyCorrect }>
			{ translate( 'Mailchimp API Key:' ) }
		</FormLabel>
		<FormTextInput
			name={ 'api_key' }
			isError={ ! isKeyCorrect }
			placeholder={ 'Enter your MailChimp API key' }
			onChange={ onChange }
			value={ apiKey }
		/>
		{ ! isKeyCorrect && <FormInputValidation isError text="Key appears to be invalid" /> }
	</FormFieldset>
) );
